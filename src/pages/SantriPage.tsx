import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { UserPlus, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

interface Santri {
  id: number;
  nis: string;
  nama: string;
  nik?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  nama_ortu?: string;
  nama_wali_kelas?: string;
  no_hp?: string;
  email?: string;
  id_prov?: number;
  id_kab?: number;
  id_kec?: number;
  id_kel?: number;
}

const SantriPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Santri>>({ nis: '', nama: '' });
  const [error, setError] = useState('');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  useEffect(() => {
    api.get('/wilayah/provinsi').then(res => setProvinces(res.data));
  }, []);

  useEffect(() => {
    if (formData.id_prov) {
      api.get(`/wilayah/kabupaten/${formData.id_prov}`).then(res => setRegencies(res.data));
    } else {
      setRegencies([]);
    }
  }, [formData.id_prov]);

  useEffect(() => {
    if (formData.id_kab) {
      api.get(`/wilayah/kecamatan/${formData.id_kab}`).then(res => setDistricts(res.data));
    } else {
      setDistricts([]);
    }
  }, [formData.id_kab]);

  useEffect(() => {
    if (formData.id_kec) {
      api.get(`/wilayah/kelurahan/${formData.id_kec}`).then(res => setVillages(res.data));
    } else {
      setVillages([]);
    }
  }, [formData.id_kec]);

  const { data: santris, isLoading } = useQuery<Santri[]>({
    queryKey: ['santri'],
    queryFn: async () => {
      const response = await api.get('/santri');
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newSantri: Partial<Santri>) => {
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Nomor Induk Santri" 
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Nomor KTP santri" 
                value={formData.nik || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, nik: val }));
                  if (val.length === 16) {
                    api.get(`/wilayah/parse-nik/${val}`).then(res => {
                      if (res.data.status) {
                        setFormData(prev => ({ ...prev, ...res.data.data }));
                      }
                    }).catch(err => console.error(err));
                  }
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Nama Lengkap Santri" 
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select 
              value={formData.jenis_kelamin || ''}
              onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
            >
              <option value="">--Jenis Kelamin--</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Tempat Lahir" 
                value={formData.tempat_lahir || ''}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="date" 
                placeholder="dd/mm/yyyy" 
                value={formData.tanggal_lahir || ''}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>Alamat Lengkap:</label>
            <select value={formData.id_prov || ''} onChange={(e) => setFormData({ ...formData, id_prov: Number(e.target.value), id_kab: undefined, id_kec: undefined, id_kel: undefined })}>
              <option value="">--Pilih Provinsi--</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            <select value={formData.id_kab || ''} onChange={(e) => setFormData({ ...formData, id_kab: Number(e.target.value), id_kec: undefined, id_kel: undefined })}>
              <option value="">--Pilih Kabupaten--</option>
              {regencies.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
            </select>
            <select value={formData.id_kec || ''} onChange={(e) => setFormData({ ...formData, id_kec: Number(e.target.value), id_kel: undefined })}>
              <option value="">--Pilih Kecamatan--</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
            <select value={formData.id_kel || ''} onChange={(e) => setFormData({ ...formData, id_kel: Number(e.target.value) })}>
              <option value="">--Pilih Kelurahan--</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.nama}</option>)}
            </select>
            <textarea 
              placeholder="Detil Alamat santri" 
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Nama orang tua / wali" 
              value={formData.nama_ortu || ''}
              onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="Nama wali kelas" 
              value={formData.nama_wali_kelas || ''}
              onChange={(e) => setFormData({ ...formData, nama_wali_kelas: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="Nomor HP, 0 diganti 62" 
              value={formData.no_hp || ''}
              onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
            />
            <input 
              type="email" 
              placeholder="Email Santri" 
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

export default SantriPage;
