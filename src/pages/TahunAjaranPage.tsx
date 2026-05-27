import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Calendar, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';

interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
}

const TahunAjaranPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<TahunAjaran>>({ nama_tahun_ajaran: '', is_active: false });
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: tahunAjarans = [], isLoading } = useQuery<TahunAjaran[]>({
    queryKey: ['tahun-ajaran'],
    queryFn: async () => {
      const response = await api.get('/tahun-ajaran');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<TahunAjaran>) => {
      if (data.id) {
        return api.put(`/tahun-ajaran/${data.id}`, data);
      }
      return api.post('/tahun-ajaran', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tahun-ajaran'] });
      // Invalidate utd as well since active year might have changed
      queryClient.invalidateQueries({ queryKey: ['utd'] });
      setIsModalOpen(false);
      setFormData({ nama_tahun_ajaran: '', is_active: false });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan data.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/tahun-ajaran/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tahun-ajaran'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal menghapus tahun ajaran.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_tahun_ajaran) {
      setError('Nama Tahun Ajaran harus diisi');
      return;
    }
    mutation.mutate(formData);
  };

  const filteredData = tahunAjarans.filter(t => 
    t.nama_tahun_ajaran.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Cari tahun ajaran..." 
            style={{ paddingLeft: '40px' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => { setFormData({ nama_tahun_ajaran: '', is_active: false }); setIsModalOpen(true); setError(''); }}>
            <Calendar size={18} />
            Tambah Tahun Ajaran
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tahun Ajaran</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data tahun ajaran</td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.nama_tahun_ajaran}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {item.is_active ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#ecfdf5', color: '#10b981', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Aktif
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
                        <XCircle size={14} /> Arsip
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '8px', background: '#f1f5f9', color: '#475569' }}
                        onClick={() => {
                          setFormData(item);
                          setIsModalOpen(true);
                          setError('');
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', opacity: item.is_active ? 0.5 : 1, cursor: item.is_active ? 'not-allowed' : 'pointer' }}
                        onClick={() => {
                          if (item.is_active) {
                            alert('Tidak dapat menghapus tahun ajaran yang sedang aktif.');
                            return;
                          }
                          if (window.confirm('Apakah Anda yakin ingin menghapus tahun ajaran ini?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
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
            totalItems={filteredData.length}
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
        onClose={() => setIsModalOpen(false)} 
        title={formData.id ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nama Tahun Ajaran</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: 2023/2024"
              value={formData.nama_tahun_ajaran || ''} 
              onChange={e => setFormData({...formData, nama_tahun_ajaran: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="is_active"
              checked={formData.is_active || false}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="is_active" style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              Jadikan Tahun Ajaran Aktif
            </label>
          </div>
          
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-12px', paddingLeft: '24px' }}>
            Jika diaktifkan, tahun ajaran lain akan otomatis dinonaktifkan (menjadi arsip).
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TahunAjaranPage;
