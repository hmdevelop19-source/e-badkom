import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Building2, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

interface Badkom {
  id: number;
  kode_badkom: string;
  nama_pj: string;
  email?: string;
  wilayah_koordinasi: string;
  alamat?: string;
  no_hp?: string;
}

const BadkomPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Badkom>>({ 
    kode_badkom: '', 
    nama_pj: '',
    email: '',
    wilayah_koordinasi: '',
    alamat: '',
    no_hp: ''
  });
  const [error, setError] = useState('');

  const { data: badkoms, isLoading } = useQuery<Badkom[]>({
    queryKey: ['badkom'],
    queryFn: async () => {
      const response = await api.get('/badkom');
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newBadkom: Partial<Badkom>) => {
      return api.post('/badkom', newBadkom);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badkom'] });
      setIsModalOpen(false);
      setFormData({ 
        kode_badkom: '', 
        nama_pj: '',
        email: '',
        wilayah_koordinasi: '',
        alamat: '',
        no_hp: ''
      });
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
          <input type="text" placeholder="Cari badkom..." style={{ paddingLeft: '40px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Building2 size={18} />
          Tambah Badkom
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kode Badkom</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama PJ</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Wilayah Koordinasi</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : badkoms?.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{b.kode_badkom}</td>
                <td style={{ padding: '16px 24px' }}>{b.nama_pj}</td>
                <td style={{ padding: '16px 24px' }}>{b.wilayah_koordinasi}</td>
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
        title="Tambah data badkom wilayah"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Kode Badkom wilayah" 
              value={formData.kode_badkom || ''}
              onChange={(e) => setFormData({ ...formData, kode_badkom: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nama PJ Badkom wilayah" 
              value={formData.nama_pj || ''}
              onChange={(e) => setFormData({ ...formData, nama_pj: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="email" 
              placeholder="Email Pengurus Badkom wilayah" 
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Wilayah kordinasi yang akan ditangani" 
              value={formData.wilayah_koordinasi || ''}
              onChange={(e) => setFormData({ ...formData, wilayah_koordinasi: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Alamat Badkom" 
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nomor telpon / hp" 
              value={formData.no_hp || ''}
              onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={mutation.isPending}
              style={{ background: '#0ea5e9' }}
            >
              {mutation.isPending ? 'Menyimpan...' : 'Save'}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => setIsModalOpen(false)}
              style={{ background: '#ef4444', color: 'white' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BadkomPage;
