import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { UserPlus, Search, Edit2, Trash2, Eye, Download, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import toast from "react-hot-toast";
import Modal from '../components/Modal';
import { ActionDropdown } from '../components/ActionDropdown';
import { TablePagination } from '../components/TablePagination';

interface Santri {
  id: number;
  nis: string;
  nama: string;
  keahlian?: string;
  status_santri?: string;
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
      nama_madrasah?: string;
      yayasan?: string;
    };
    tahun_ajaran?: {
      id: number;
      nama_tahun_ajaran: string;
      is_active: boolean;
    };
    penilaian?: {
      id: number;
      keterangan: string;
      predikat: string;
      status_badkom_pusat: string;
    };
    mutasis?: Array<{
      id: number;
      tanggal_mutasi: string;
      alasan: string;
      asal_pjutd?: {
        nama_pjutd: string;
        nama_madrasah?: string;
        yayasan?: string;
      };
      tujuan_pjutd?: {
        nama_pjutd: string;
        nama_madrasah?: string;
        yayasan?: string;
      };
    }>;
    status: string;
    created_at: string;
  }>;
}

const SantriPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [formData, setFormData] = useState<Partial<Santri>>({ nis: '', nama: '' });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const filteredSantris = santris?.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredSantris.length / itemsPerPage);
  const paginatedSantris = filteredSantris.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const getTargetTugasWajib = () => {
    const setting = settings.find((s: any) => s.key === 'target_tugas_wajib');
    return setting && !isNaN(Number(setting.value)) ? Number(setting.value) : 3;
  };

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
      await api.post('/santri/import/csv', formData);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      toast.success('Data santri berhasil diimport');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengimport data');
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
      toast.error('Gagal mengekspor data.');
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
      toast.error('Gagal mengunduh template.');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {
      const response = await api.post('/santri/import/excel', formDataFile);
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor file Excel.');
    }
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/santri/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'santri_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengekspor data Excel.');
    }
  };

  const handleDownloadTemplateExcel = async () => {
    try {
      const response = await api.get('/santri/template/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'santri_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh template Excel.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          background: #ffffff;
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }

        .search-container {
          position: relative;
          width: 320px;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .search-input:focus {
          background: #ffffff;
          border-color: var(--secondary);
          box-shadow: 0 0 0 4px rgba(0, 143, 215, 0.1);
          outline: none;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .data-table-container {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 18px 24px;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .data-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
          vertical-align: middle;
        }

        .data-table tbody tr {
          transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
          background: #f8fafc;
          transform: scale(1.001);
        }

        .action-btn {
          border: none;
          background: none;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-btn.view { color: #0284c7; }
        .action-btn.view:hover { background: #e0f2fe; }

        .action-btn.edit { color: #64748b; }
        .action-btn.edit:hover { background: #f1f5f9; color: #0f172a; }

        .action-btn.delete { color: #ef4444; }
        .action-btn.delete:hover { background: #fee2e2; }
      `}</style>

      <div className="page-header">
        <div className="search-container">
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Cari nama atau NIS santri..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" style={{ display: 'none' }} />
          <input type="file" ref={excelInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" style={{ display: 'none' }} />
          
          <ActionDropdown
            label="Template"
            icon={<FileText size={18} />}
            buttonStyle={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #cbd5e1' }}
            items={[
              { label: 'Template CSV', icon: <FileText size={16} />, onClick: handleDownloadTemplate },
              { label: 'Template Excel', icon: <FileSpreadsheet size={16} />, onClick: handleDownloadTemplateExcel }
            ]}
          />

          <ActionDropdown
            label="Export"
            icon={<Download size={18} />}
            buttonStyle={{ background: '#f8fafc', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600 }}
            items={[
              { label: 'Export CSV', icon: <FileText size={16} />, onClick: handleExport },
              { label: 'Export Excel', icon: <FileSpreadsheet size={16} />, onClick: handleExportExcel }
            ]}
          />

          <ActionDropdown
            label="Import"
            icon={<Upload size={18} />}
            buttonStyle={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 600 }}
            items={[
              { label: 'Import CSV', icon: <FileText size={16} />, onClick: () => fileInputRef.current?.click() },
              { label: 'Import Excel', icon: <FileSpreadsheet size={16} />, onClick: () => excelInputRef.current?.click() }
            ]}
          />

          <button className="btn btn-primary" onClick={() => {
            setIsEditMode(false);
            setFormData({ nis: '', nama: '' });
            setError('');
            setIsModalOpen(true);
          }} style={{ borderRadius: '30px', padding: '10px 24px', boxShadow: '0 4px 12px rgba(66, 47, 111, 0.2)' }}>
            <UserPlus size={18} />
            Tambah Santri
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Lengkap</th>
              <th>Status</th>
              <th>Progress Tugas Wajib</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedSantris.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data yang ditemukan.</td>
              </tr>
            ) : paginatedSantris.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: '#334155' }}>{s.nis}</td>
                <td style={{ fontWeight: 500, color: '#0f172a' }}>{s.nama}</td>
                <td>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    background: s.status_santri === 'Menunggu Boyong' ? '#fef3c7' : '#f0fdfa', 
                    color: s.status_santri === 'Menunggu Boyong' ? '#b45309' : '#0f766e', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    border: `1px solid ${s.status_santri === 'Menunggu Boyong' ? '#fde68a' : '#ccfbf1'}`
                  }}>
                    {s.status_santri || 'Aktif'}
                  </span>
                </td>
                <td>
                  {(() => {
                    const target = getTargetTugasWajib();
                    const validLulus = s.utds?.filter(u => u.penilaian?.keterangan === 'Lulus').length || 0;
                    const progress = Math.min((validLulus / target) * 100, 100);

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '160px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ color: validLulus >= target ? '#15803d' : '#64748b' }}>
                            {validLulus} / {target} Lulus
                          </span>
                          <span style={{ color: validLulus >= target ? '#15803d' : '#ca8a04' }}>
                            {validLulus >= target ? 'Selesai' : 'Belum Selesai'}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: validLulus >= target ? '#22c55e' : 'var(--secondary)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                    <button 
                      className="action-btn view"
                      onClick={() => {
                        api.get(`/santri/${s.id}`).then(res => {
                          setSelectedSantri(res.data);
                          setIsDetailModalOpen(true);
                        }).catch(err => {
                          console.error(err);
                          toast.error('Gagal mengambil data detail santri.');
                        });
                      }}
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="action-btn edit"
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
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button className="action-btn delete" title="Hapus"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!isLoading && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSantris.length}
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
                <label className="form-label">NIK WALI (Untuk Auto-fill)</label>
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
                          toast.success('Data Wali berhasil ditemukan dan diisi otomatis.');
                        }
                      }).catch(err => console.error(err));
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">NAMA ORANG TUA / WALI *</label>
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
                <label className="form-label">NOMOR HP / WHATSAPP WALI</label>
                <input
                  type="text"
                  placeholder="Mulai dengan 62xxx"
                  value={formData.no_hp_wali || ''}
                  onChange={(e) => setFormData({ ...formData, no_hp_wali: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">ALAMAT EMAIL WALI</label>
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
                <label className="form-label">NOMOR INDUK SANTRI (NIS) *</label>
                <input
                  type="text"
                  placeholder="Masukkan NIS"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">NOMOR INDUK KEPENDUDUKAN (NIK)</label>
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
              <label className="form-label">NAMA LENGKAP SANTRI *</label>
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
                <label className="form-label">JENIS KELAMIN</label>
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
                <label className="form-label">TEMPAT LAHIR</label>
                <input
                  type="text"
                  placeholder="Kota/Kabupaten"
                  value={formData.tempat_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">TANGGAL LAHIR</label>
                <input
                  type="date"
                  value={formData.tanggal_lahir || ''}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
              <label className="form-label">KEAHLIAN KHUSUS (OPSIONAL)</label>
              <input
                type="text"
                placeholder="Contoh: Qori, Kaligrafi, Bahasa Arab, dll"
                value={formData.keahlian || ''}
                onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
              />
            </div>
          </div>

          {/* Section: Alamat Lengkap */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Alamat Lengkap</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">PROVINSI</label>
                <select value={formData.id_prov || ''} onChange={(e) => setFormData({ ...formData, id_prov: Number(e.target.value), id_kab: undefined, id_kec: undefined, id_kel: undefined })}>
                  <option value="">-- Pilih Provinsi --</option>
                  {provinces.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">KABUPATEN / KOTA</label>
                <select value={formData.id_kab || ''} onChange={(e) => setFormData({ ...formData, id_kab: Number(e.target.value), id_kec: undefined, id_kel: undefined })}>
                  <option value="">-- Pilih Kabupaten --</option>
                  {regencies.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">KECAMATAN</label>
                <select value={formData.id_kec || ''} onChange={(e) => setFormData({ ...formData, id_kec: Number(e.target.value), id_kel: undefined })}>
                  <option value="">-- Pilih Kecamatan --</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">KELURAHAN / DESA</label>
                <select value={formData.id_kel || ''} onChange={(e) => setFormData({ ...formData, id_kel: Number(e.target.value) })}>
                  <option value="">-- Pilih Kelurahan --</option>
                  {villages.map(v => <option key={v.id} value={v.id}>{v.nama}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">DETAIL ALAMAT (JALAN/RT/RW)</label>
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
            {/* Top Cards Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Data Pribadi Card */}
              <div style={{ 
                background: '#ffffff', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Data Pribadi</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NIS / NIK</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>{selectedSantri.nis} / {selectedSantri.nik || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Lengkap</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: '2px' }}>{selectedSantri.nama}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lahir</div>
                      <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.tempat_lahir || '-'}, {selectedSantri.tanggal_lahir ? new Date(selectedSantri.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</div>
                      <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.jenis_kelamin === 'L' ? 'Laki-laki' : selectedSantri.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keahlian Khusus</div>
                    <div style={{ fontWeight: 500, color: '#0369a1', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.keahlian || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Kontak & Alamat Card */}
              <div style={{ 
                background: '#ffffff', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Kontak & Wali</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Orang Tua/Wali</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>{selectedSantri.wali?.nama_wali || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIK: {selectedSantri.wali?.nik || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kontak Wali</div>
                    <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.wali?.no_hp || '-'} / {selectedSantri.wali?.email || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alamat Lengkap</div>
                    <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px', lineHeight: 1.5 }}>{selectedSantri.alamat || 'Alamat belum diisi'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Penugasan Card */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden' 
            }}>
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Riwayat Penugasan (UTD)</h3>
              </div>
              
              {selectedSantri.utds && selectedSantri.utds.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Tahun Ajaran</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Tempat Tugas</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Penilaian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSantri.utds.map((utd) => (
                        <React.Fragment key={utd.id}>
                          <tr style={{ transition: 'background 0.2s', ':hover': { background: '#f8fafc' } } as any}>
                            <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                              {utd.tahun_ajaran?.nama_tahun_ajaran || '-'}
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{utd.pjutd?.nama_madrasah || utd.pjutd?.yayasan || utd.pjutd?.nama_pjutd || '-'}</div>
                              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>ID: {utd.pjutd?.kode_lembaga}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              {(() => {
                                let displayStatus = utd.status || 'Aktif';
                                if (displayStatus === 'Aktif' && utd.tahun_ajaran && !utd.tahun_ajaran.is_active) displayStatus = 'Selesai';
                                
                                const getBadgeStyle = (status: string) => {
                                  switch(status) {
                                    case 'Aktif': return { bg: '#f0fdfa', color: '#0f766e', border: '#ccfbf1' };
                                    case 'Ditarik': return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
                                    case 'Dimutasi': return { bg: '#fffbeb', color: '#b45309', border: '#fef3c7' };
                                    case 'Selesai': return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
                                    default: return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
                                  }
                                };
                                const badgeStyle = getBadgeStyle(displayStatus);

                                return (
                                  <span style={{ 
                                    padding: '4px 12px', 
                                    borderRadius: '20px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600,
                                    background: badgeStyle.bg,
                                    color: badgeStyle.color,
                                    border: `1px solid ${badgeStyle.border}`
                                  }}>
                                    {displayStatus}
                                  </span>
                                );
                              })()}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              {utd.penilaian ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 700, color: utd.penilaian.keterangan === 'Lulus' ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                                      {utd.penilaian.keterangan}
                                    </span>
                                    <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #e2e8f0' }}>
                                      {utd.penilaian.predikat}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                                    Pusat: {utd.penilaian.status_badkom_pusat}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 500 }}>Belum dinilai</span>
                              )}
                            </td>
                          </tr>
                          
                          {/* Mutasi History Sub-row */}
                          {utd.mutasis && utd.mutasis.length > 0 && (
                            <tr>
                              <td colSpan={4} style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px dashed #fcd34d', position: 'relative' }}>
                                  <div style={{ position: 'absolute', left: '-6px', top: '24px', width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', border: '3px solid #fff' }}></div>
                                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.7rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 700, letterSpacing: '0.05em', paddingLeft: '12px' }}>Riwayat Mutasi</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px' }}>
                                    {utd.mutasis.map(mutasi => (
                                      <div key={mutasi.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.8rem' }}>{new Date(mutasi.tanggal_mutasi).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                          <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{mutasi.asal_pjutd?.nama_madrasah || mutasi.asal_pjutd?.yayasan || mutasi.asal_pjutd?.nama_pjutd || '-'}</span> 
                                          <span style={{ margin: '0 8px', color: '#f59e0b' }}>&rarr;</span> 
                                          <span style={{ fontWeight: 600, color: '#047857' }}>{mutasi.tujuan_pjutd?.nama_madrasah || mutasi.tujuan_pjutd?.yayasan || mutasi.tujuan_pjutd?.nama_pjutd || '-'}</span>
                                        </div>
                                        <div style={{ color: '#78350f', fontSize: '0.75rem', fontStyle: 'italic' }}>Alasan: {mutasi.alasan}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📋</div>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Santri ini belum memiliki riwayat penugasan.</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
              <button 
                className="btn" 
                onClick={() => setIsDetailModalOpen(false)} 
                style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  fontWeight: 600, 
                  borderRadius: '30px', 
                  padding: '10px 24px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SantriPage;
