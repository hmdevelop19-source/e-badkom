import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { UserPlus, Search, Edit2, Trash2, Save } from 'lucide-react';
import Modal from '../components/Modal';

interface Santri {
  id: number;
  nis: string;
  nama: string;
}

const SantriPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nis: '', nama: '' });
  const [error, setError] = useState('');

  const { data: santris, isLoading } = useQuery<Santri[]>({
    queryKey: ['santri'],
    queryFn: async () => {
      const response = await api.get('/santri');
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newSantri: { nis: string; nama: string }) => {
      return api.post('/santri', newSantri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      setIsModalOpen(false);
      setFormData({ nis: '', nama: '' });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Cari santri..." style={{ paddingLeft: '40px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          Tambah Santri
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>NIS</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : santris?.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{s.nis}</td>
                <td style={{ padding: '16px 24px' }}>{s.nama}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }}>Aktif</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Tambah Santri Baru"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NIS</label>
            <input 
              type="text" 
              placeholder="Masukkan NIS" 
              value={formData.nis}
              onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Masukkan Nama Lengkap" 
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={() => setIsModalOpen(false)}
              style={{ background: '#f1f5f9' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={mutation.isPending}
            >
              <Save size={18} />
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Santri'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SantriPage;
