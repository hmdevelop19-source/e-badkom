import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Search, Edit2, Trash2, Shield, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';

interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  level: string;
  badkom_id?: number;
  pjutd_id?: number;
  santri_id?: number;
  badkom?: any;
  pjutd?: any;
  santri?: any;
}

const UserPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState<Partial<User>>({ 
    username: '', fullname: '', email: '', level: 'badkom_wilayah' 
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get current logged-in user to determine permissions
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isSuperAdmin = currentUser?.level === 'admin' || currentUser?.level === 'badkom_pusat';

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  const { data: badkoms = [] } = useQuery({
    queryKey: ['badkom'],
    queryFn: async () => {
      const response = await api.get('/badkom');
      return response.data;
    }
  });

  const { data: pjutds = [] } = useQuery({
    queryKey: ['pjutd'],
    queryFn: async () => {
      const response = await api.get('/pjutd');
      return response.data;
    }
  });

  const { data: santris = [] } = useQuery({
    queryKey: ['santri'],
    queryFn: async () => {
      const response = await api.get('/santri');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedUser) {
        return api.put(`/users/${selectedUser.id}`, data);
      }
      return api.post('/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan data.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...formData };
    if (password) {
      payload.password = password;
    }
    
    // Automatically assign badkom_id if the creator is badkom_wilayah
    if (currentUser?.level === 'badkom_wilayah' && payload.level === 'pjutd') {
      payload.badkom_id = currentUser.badkom_id;
    }

    mutation.mutate(payload);
  };

  const openModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        level: user.level,
        badkom_id: user.badkom_id,
        pjutd_id: user.pjutd_id,
        santri_id: user.santri_id,
      });
      setPassword('');
    } else {
      setSelectedUser(null);
      setFormData({ username: '', fullname: '', email: '', level: 'badkom_wilayah' });
      setPassword('');
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({});
    setPassword('');
    setError('');
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      admin: 'Super Admin',
      badkom_pusat: 'Badkom Pusat',
      badkom_wilayah: 'Badkom Wilayah',
      pjutd: 'PJ UTD (Lembaga)',
      utd: 'UTD (Santri)'
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      admin: '#dc2626', // red
      badkom_pusat: '#9333ea', // purple
      badkom_wilayah: '#2563eb', // blue
      pjutd: '#059669', // green
      utd: '#d97706' // orange
    };
    return colors[level] || '#64748b';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Cari username, nama..." 
            style={{ paddingLeft: '40px' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} /> Tambah Akun
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pengguna</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hak Akses (Level)</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Afiliasi Data</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada akun pengguna</td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullname}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{user.username} • {user.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '4px 10px', 
                      borderRadius: '16px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      color: getLevelColor(user.level),
                      background: `${getLevelColor(user.level)}1a`
                    }}>
                      <Shield size={12} /> {getLevelLabel(user.level)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem' }}>
                    {user.level === 'badkom_wilayah' && user.badkom && (
                      <div><span style={{ color: 'var(--text-secondary)' }}>Badkom:</span> {user.badkom.nama_pj}</div>
                    )}
                    {user.level === 'pjutd' && user.pjutd && (
                      <div><span style={{ color: 'var(--text-secondary)' }}>PJ UTD:</span> {user.pjutd.nama_pjutd}</div>
                    )}
                    {user.level === 'utd' && user.santri && (
                      <div><span style={{ color: 'var(--text-secondary)' }}>Santri:</span> {user.santri.nama}</div>
                    )}
                    {['admin', 'badkom_pusat'].includes(user.level) && (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Semua Wilayah</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '8px', background: '#f1f5f9', color: '#475569' }}
                        onClick={() => openModal(user)}
                        title="Edit Akun"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '8px', background: '#fef2f2', color: '#ef4444' }}
                        onClick={() => {
                          if (window.confirm('Yakin ingin menghapus akun ini?')) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
                        disabled={user.id === currentUser?.id}
                        title="Hapus Akun"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={selectedUser ? "Edit Akun Pengguna" : "Tambah Akun Pengguna"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.username || ''}
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={formData.email || ''}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.fullname || ''}
              onChange={e => setFormData({...formData, fullname: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password {selectedUser && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={!selectedUser}
              minLength={6}
            />
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Hak Akses (Level)</label>
            <select 
              className="form-control" 
              value={formData.level || 'badkom_wilayah'}
              onChange={e => setFormData({...formData, level: e.target.value, badkom_id: undefined, pjutd_id: undefined, santri_id: undefined})}
              required
            >
              {isSuperAdmin && <option value="admin">Super Admin</option>}
              {isSuperAdmin && <option value="badkom_pusat">Badkom Pusat</option>}
              {isSuperAdmin && <option value="badkom_wilayah">Badkom Wilayah</option>}
              <option value="pjutd">PJ UTD (Lembaga)</option>
              <option value="utd">UTD (Santri)</option>
            </select>
          </div>

          {/* Conditional Binding Fields */}
          {formData.level === 'badkom_wilayah' && isSuperAdmin && (
            <div className="form-group">
              <label className="form-label">Pilih Wilayah (Badkom)</label>
              <select 
                className="form-control" 
                value={formData.badkom_id || ''}
                onChange={e => setFormData({...formData, badkom_id: Number(e.target.value)})}
                required
              >
                <option value="">-- Pilih Badkom Wilayah --</option>
                {badkoms.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.nama_pj} ({b.wilayah_koordinasi})</option>
                ))}
              </select>
            </div>
          )}

          {formData.level === 'pjutd' && (
            <div className="form-group">
              <label className="form-label">Pilih PJ UTD</label>
              <select 
                className="form-control" 
                value={formData.pjutd_id || ''}
                onChange={e => setFormData({...formData, pjutd_id: Number(e.target.value)})}
                required
              >
                <option value="">-- Pilih Lembaga PJ UTD --</option>
                {pjutds.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nama_pjutd} ({p.kode_lembaga})</option>
                ))}
              </select>
            </div>
          )}

          {formData.level === 'utd' && (
            <div className="form-group">
              <label className="form-label">Pilih Santri</label>
              <select 
                className="form-control" 
                value={formData.santri_id || ''}
                onChange={e => setFormData({...formData, santri_id: Number(e.target.value)})}
                required
              >
                <option value="">-- Pilih Santri --</option>
                {santris.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserPage;
