import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { UserPlus, Search, Edit2, Trash2, Eye, Download, Upload, FileText } from 'lucide-react';
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
  id_prov?: number;
  id_kab?: number;
  id_kec?: number;
  id_kel?: number;
  wali_id?: number;
  wali?: {
    nik?: string;
    nama_wali: string;
    no_hp?: string;
    email?: string;
  };
  nik_wali?: string;
  nama_wali?: string;
  no_hp_wali?: string;
  email_wali?: string;
  utds?: Array<{
    id: number;
    pjutd?: {
      id: number;
      nama_pjutd: string;
      kode_lembaga: string;
    };
    created_at: string;
  }>;
}

const SantriPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
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
      if (isEditMode && newSantri.id) {
        return api.put(`/santri/${newSantri.id}`, newSantri);
      }
      return api.post('/santri', newSantri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      setIsModalOpen(false);
      setIsEditMode(false);
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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/santri/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      alert('Data santri berhasil diimport');
    } catch (err) {
      console.error(err);
      alert('Gagal mengimport data');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/santri/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'santri_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Gagal mengekspor data.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/santri/template/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'santri_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Gagal mengunduh template.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Cari santri..." style={{ paddingLeft: '40px', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" style={{ display: 'none' }} />
          
          <button className="btn" onClick={handleDownloadTemplate} style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
            <FileText size={18} />
            Template CSV
          </button>
          
          <button className="btn" onClick={handleExport} style={{ background: '#f8fafc', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600 }}>
            <Download size={18} />
            Export CSV
          </button>
          
          <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 600 }}>
            <Upload size={18} />
            Import CSV
          </button>

          <button className="btn btn-primary" onClick={() => {
            setIsEditMode(false);
            setFormData({ nis: '', nama: '' });
            setError('');
            setIsModalOpen(true);
          }}>
            <UserPlus size={18} />
            Tambah Santri
          </button>
        </div>
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
                    <button 
                      onClick={() => {
                        api.get(`/santri/${s.id}`).then(res => {
                          setSelectedSantri(res.data);
                          setIsDetailModalOpen(true);
                        }).catch(err => {
                          console.error(err);
                          alert('Gagal mengambil data detail santri. Pastikan backend berjalan dengan baik atau coba restart php artisan serve.');
                        });
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0284c7' }} title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditMode(true);
                        setFormData({
                          ...s,
                          nik_wali: s.wali?.nik || '',
                          nama_wali: s.wali?.nama_wali || '',
                          no_hp_wali: s.wali?.no_hp || '',
                          email_wali: s.wali?.email || ''
                        });
                        setError('');
                        setIsModalOpen(true);
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} title="Hapus"><Trash2 size={16} /></button>
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
        title={isEditMode ? "Edit Data Santri" : "Tambah Santri Baru"}
        maxWidth="750px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* Section: Kontak & Wali */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Data Wali & Kontak</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NIK WALI (Untuk Auto-fill)</label>
                <input
                  type="text"
                  placeholder="16 Digit NIK Wali"
                  value={formData.nik_wali || ''}
                  maxLength={16}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, nik_wali: val }));
                    if (val.length === 16) {
                      api.get(`/wali/by-nik/${val}`).then(res => {
                        if (res.data.status) {
                          setFormData(prev => ({
                            ...prev,
                            nama_wali: res.data.data.nama_wali,
                            no_hp_wali: res.data.data.no_hp,
                            email_wali: res.data.data.email
                          }));
                          alert('Data Wali berhasil ditemukan dan diisi otomatis.');
                        }
                      }).catch(err => console.error(err));
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NAMA ORANG TUA / WALI *</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Wali"
                  value={formData.nama_wali || ''}
                  onChange={(e) => setFormData({ ...formData, nama_wali: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NOMOR HP / WHATSAPP WALI</label>
                <input
                  type="text"
                  placeholder="Mulai dengan 62xxx"
                  value={formData.no_hp_wali || ''}
                  onChange={(e) => setFormData({ ...formData, no_hp_wali: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ALAMAT EMAIL WALI</label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={formData.email_wali || ''}
                  onChange={(e) => setFormData({ ...formData, email_wali: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Data Pribadi */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Data Pribadi Santri</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NOMOR INDUK SANTRI (NIS) *</label>
                <input
                  type="text"
                  placeholder="Masukkan NIS"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NOMOR INDUK KEPENDUDUKAN (NIK)</label>
                <input
                  type="text"
                  placeholder="16 Digit NIK (Auto-fill)"
                  value={formData.nik || ''}
                  maxLength={16}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NAMA LENGKAP SANTRI *</label>
              <input
                type="text"
                placeholder="Nama Lengkap Sesuai Dokumen"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>JENIS KELAMIN</label>
                <select
                  value={formData.jenis_kelamin || ''}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                >
                  <option value="">-- Pilih --</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TEMPAT LAHIR</label>
                <input
                  type="text"
                  placeholder="Kota/Kabupaten"
                  value={formData.tempat_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TANGGAL LAHIR</label>
                <input
                  type="date"
                  value={formData.tanggal_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Alamat Lengkap */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Alamat Lengkap</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PROVINSI</label>
                <select value={formData.id_prov || ''} onChange={(e) => setFormData({ ...formData, id_prov: Number(e.target.value), id_kab: undefined, id_kec: undefined, id_kel: undefined })}>
                  <option value="">-- Pilih Provinsi --</option>
                  {provinces.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KABUPATEN / KOTA</label>
                <select value={formData.id_kab || ''} onChange={(e) => setFormData({ ...formData, id_kab: Number(e.target.value), id_kec: undefined, id_kel: undefined })}>
                  <option value="">-- Pilih Kabupaten --</option>
                  {regencies.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KECAMATAN</label>
                <select value={formData.id_kec || ''} onChange={(e) => setFormData({ ...formData, id_kec: Number(e.target.value), id_kel: undefined })}>
                  <option value="">-- Pilih Kecamatan --</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KELURAHAN / DESA</label>
                <select value={formData.id_kel || ''} onChange={(e) => setFormData({ ...formData, id_kel: Number(e.target.value) })}>
                  <option value="">-- Pilih Kelurahan --</option>
                  {villages.map(v => <option key={v.id} value={v.id}>{v.nama}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DETAIL ALAMAT (JALAN/RT/RW)</label>
              <textarea
                placeholder="Contoh: Jl. Merdeka No. 12, RT 01 / RW 02"
                value={formData.alamat || ''}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setIsModalOpen(false)}
              style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.isPending}
              style={{ padding: '10px 24px' }}
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail & Riwayat Penugasan */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail & Riwayat Penugasan Santri"
        maxWidth="800px"
      >
        {selectedSantri && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Data Pribadi</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NIS / NIK</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.nis} / {selectedSantri.nik || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nama Lengkap</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.nama}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tempat, Tanggal Lahir</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.tempat_lahir || '-'}, {selectedSantri.tanggal_lahir ? new Date(selectedSantri.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Jenis Kelamin</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.jenis_kelamin === 'L' ? 'Laki-laki' : selectedSantri.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Kontak & Alamat</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nomor HP / Email Wali</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.wali?.no_hp || '-'} / {selectedSantri.wali?.email || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nama Orang Tua/Wali</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.wali?.nama_wali || '-'} (NIK: {selectedSantri.wali?.nik || '-'})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Alamat Lengkap</span>
                    <span style={{ fontWeight: 500 }}>{selectedSantri.alamat || 'Alamat belum diisi'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 20px', background: '#f8fafc', margin: 0, borderBottom: '1px solid #e2e8f0' }}>Riwayat Penugasan (UTD)</h3>
              {selectedSantri.utds && selectedSantri.utds.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '12px 20px', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Tanggal</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Kode Lembaga</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Nama PJUTD (Lembaga)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSantri.utds.map((utd) => (
                      <tr key={utd.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.875rem' }}>{new Date(utd.created_at).toLocaleDateString('id-ID')}</td>
                        <td style={{ padding: '12px 20px', fontSize: '0.875rem', fontWeight: 500 }}>{utd.pjutd?.kode_lembaga || '-'}</td>
                        <td style={{ padding: '12px 20px', fontSize: '0.875rem' }}>{utd.pjutd?.nama_pjutd || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Belum ada riwayat penugasan.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button className="btn" onClick={() => setIsDetailModalOpen(false)} style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SantriPage;
