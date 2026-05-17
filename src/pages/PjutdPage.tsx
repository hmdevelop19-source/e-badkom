import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Network, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

interface Badkom {
  id: number;
  kode_badkom: string;
  nama_pj: string;
}

interface Pjutd {
  id: number;
  kode_lembaga: string;
  nama_pjutd: string;
  nama_madrasah?: string;
  yayasan?: string;
  no_hp?: string;
  badkom_id: number;
  badkom?: Badkom;
  id_prov?: number;
  id_kab?: number;
  id_kec?: number;
  id_kel?: number;
  alamat?: string;
}

const PjutdPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Pjutd>>({ 
    kode_lembaga: '', 
    nama_pjutd: '',
    nama_madrasah: '',
    yayasan: '',
    no_hp: '',
    badkom_id: undefined,
    id_prov: undefined,
    id_kab: undefined,
    id_kec: undefined,
    id_kel: undefined,
    alamat: ''
  });
  const [error, setError] = useState('');

  const { data: pjutds, isLoading } = useQuery<Pjutd[]>({
    queryKey: ['pjutd'],
    queryFn: async () => {
      const response = await api.get('/pjutd');
      return response.data;
    },
  });

  const { data: badkoms } = useQuery<Badkom[]>({
    queryKey: ['badkom'],
    queryFn: async () => {
      const response = await api.get('/badkom');
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newPjutd: Partial<Pjutd>) => {
      return api.post('/pjutd', newPjutd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pjutd'] });
      setIsModalOpen(false);
      setFormData({ 
        kode_lembaga: '', 
        nama_pjutd: '',
        nama_madrasah: '',
        yayasan: '',
        no_hp: '',
        badkom_id: undefined,
        alamat: ''
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
          <input type="text" placeholder="Cari PJ UTD..." style={{ paddingLeft: '40px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Network size={18} />
          Tambah PJ UTD
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kode Lembaga</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama PJ UTD</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Badkom</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : pjutds?.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{p.kode_lembaga}</td>
                <td style={{ padding: '16px 24px' }}>{p.nama_pjutd}</td>
                <td style={{ padding: '16px 24px' }}>{p.badkom?.kode_badkom || '-'}</td>
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
        title="Menambah data PJ UTD"
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
              placeholder="Kode Lembaga" 
              value={formData.kode_lembaga || ''}
              onChange={(e) => setFormData({ ...formData, kode_lembaga: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nama Lengkap PJ UTD" 
              value={formData.nama_pjutd || ''}
              onChange={(e) => setFormData({ ...formData, nama_pjutd: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nama Madrasah" 
              value={formData.nama_madrasah || ''}
              onChange={(e) => setFormData({ ...formData, nama_madrasah: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nama Yayasan" 
              value={formData.yayasan || ''}
              onChange={(e) => setFormData({ ...formData, yayasan: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nomor HP, 0 diganti 62" 
              value={formData.no_hp || ''}
              onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>Wilayah kordinasi:</label>
            <select 
              value={formData.badkom_id || ''} 
              onChange={(e) => setFormData({ ...formData, badkom_id: Number(e.target.value) })}
              required
            >
              <option value="">--Pilih Badkom--</option>
              {badkoms?.map(b => (
                <option key={b.id} value={b.id}>{b.kode_badkom} - {b.nama_pj}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>Alamat Lengkap:</label>
            <select value={formData.id_prov || ''} onChange={(e) => setFormData({ ...formData, id_prov: Number(e.target.value) })}>
              <option value="">--Pilih Provinsi--</option>
              <option value="1">Jawa Timur</option>
            </select>
            <select value={formData.id_kab || ''} onChange={(e) => setFormData({ ...formData, id_kab: Number(e.target.value) })}>
              <option value="">--Pilih Kabupaten--</option>
              <option value="1">Pamekasan</option>
            </select>
            <select value={formData.id_kec || ''} onChange={(e) => setFormData({ ...formData, id_kec: Number(e.target.value) })}>
              <option value="">--Pilih Kecamatan--</option>
              <option value="1">Palengaan</option>
            </select>
            <select value={formData.id_kel || ''} onChange={(e) => setFormData({ ...formData, id_kel: Number(e.target.value) })}>
              <option value="">--Pilih Kelurahan--</option>
              <option value="1">Potoan Laok</option>
            </select>
            <textarea 
              placeholder="Detil Alamat PJ UTD" 
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              rows={3}
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
              style={{ background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0' }}
            >
              Close
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PjutdPage;
