import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Network, Search, Edit2, Trash2, Download, Upload, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '../contexts/DialogContext';
import Modal from '../components/Modal';
import { ActionDropdown } from '../components/ActionDropdown';
import { TablePagination } from '../components/TablePagination';

interface Badkom {
  id: number;
  kode_badkom: string;
  wilayah_koordinasi: string;
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
  utds?: Array<{
    id: number;
    tahun_ajaran?: {
      nama_tahun_ajaran: string;
    };
    santri?: {
      nama: string;
      nik: string;
      nis: string;
    };
  }>;
}

const PjutdPage: React.FC = () => {
  const { showConfirm } = useDialog();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPjutd, setSelectedPjutd] = useState<Pjutd | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const initialFormState: Partial<Pjutd> = { 
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
  };

  const [formData, setFormData] = useState<Partial<Pjutd>>(initialFormState);
  const [error, setError] = useState('');

  // Wilayah States
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

  const filteredPjutds = useMemo(() => {
    if (!pjutds) return [];
    return pjutds.filter(p => 
      p.kode_lembaga.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nama_pjutd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.badkom?.kode_badkom || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pjutds, searchQuery]);

  const totalPages = Math.ceil(filteredPjutds.length / itemsPerPage);
  const paginatedPjutds = filteredPjutds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const mutation = useMutation({
    mutationFn: (newPjutd: Partial<Pjutd>) => {
      if (newPjutd.id) {
        return api.put(`/pjutd/${newPjutd.id}`, newPjutd);
      }
      return api.post('/pjutd', newPjutd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pjutd'] });
      setIsModalOpen(false);
      setFormData(initialFormState);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/pjutd/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pjutd'] });
    },
    onError: () => {
      toast.error('Gagal menghapus data.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleEdit = (pjutd: Pjutd) => {
    setFormData(pjutd);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    showConfirm('Apakah Anda yakin ingin menghapus data PJ UTD ini?', () => {
      deleteMutation.mutate(id);
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {
      const response = await api.post('/pjutd/import/csv', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['pjutd'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor file.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/pjutd/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pjutd_export.csv');
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
      const response = await api.get('/pjutd/template/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pjutd_template.csv');
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
      const response = await api.post('/pjutd/import/excel', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['pjutd'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor file Excel.');
    }
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/pjutd/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pjutd_export.xlsx');
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
      const response = await api.get('/pjutd/template/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pjutd_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh template Excel.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Cari PJ UTD..." 
            style={{ paddingLeft: '40px' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionDropdown
            label="Template"
            icon={<FileText size={16} />}
            buttonStyle={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
            items={[
              { label: 'Template CSV', icon: <FileText size={16} />, onClick: handleDownloadTemplate },
              { label: 'Template Excel', icon: <FileSpreadsheet size={16} />, onClick: handleDownloadTemplateExcel }
            ]}
          />
          <ActionDropdown
            label="Export"
            icon={<Download size={16} />}
            buttonStyle={{ background: '#f8fafc', color: '#0284c7', border: '1px solid #bae6fd' }}
            items={[
              { label: 'Export CSV', icon: <FileText size={16} />, onClick: handleExport },
              { label: 'Export Excel', icon: <FileSpreadsheet size={16} />, onClick: handleExportExcel }
            ]}
          />
          <ActionDropdown
            label="Import"
            icon={<Upload size={16} />}
            buttonStyle={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
            items={[
              { label: 'Import CSV', icon: <FileText size={16} />, onClick: () => fileInputRef.current?.click() },
              { label: 'Import Excel', icon: <FileSpreadsheet size={16} />, onClick: () => excelInputRef.current?.click() }
            ]}
          />

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".csv"
            onChange={handleImport}
          />
          <input
            type="file"
            ref={excelInputRef}
            style={{ display: 'none' }}
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
          />
          <input
            type="file"
            ref={excelInputRef}
            style={{ display: 'none' }}
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
          />
          <button className="btn btn-primary" onClick={() => { setFormData(initialFormState); setIsModalOpen(true); }}>
            <Network size={18} />
            Tambah PJ UTD
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kode Lembaga</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama PJ UTD</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Yayasan / Madrasah</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Badkom</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedPjutds?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data PJ UTD.</td>
              </tr>
            ) : paginatedPjutds?.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{p.kode_lembaga}</td>
                <td style={{ padding: '16px 24px' }}>{p.nama_pjutd}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.875rem' }}>{p.yayasan || '-'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.nama_madrasah || '-'}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ display: 'inline-block', padding: '4px 12px', background: '#f1f5f9', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
                    {p.badkom?.kode_badkom || '-'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        setSelectedPjutd(p);
                        setIsDetailModalOpen(true);
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title="Lihat Detail & Riwayat UTD"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(p)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title="Edit PJ UTD"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Hapus PJ UTD"
                    >
                      <Trash2 size={16} />
                    </button>
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
            totalItems={filteredPjutds.length}
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
        title={formData.id ? "Edit Data PJ UTD" : "Menambah Data PJ UTD"}
        maxWidth="700px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          {/* Section: Identitas Lembaga */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Identitas Lembaga</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KODE LEMBAGA *</label>
                  <input 
                    type="text" 
                    placeholder="Misal: UTD-01" 
                    value={formData.kode_lembaga || ''}
                    onChange={(e) => setFormData({ ...formData, kode_lembaga: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NAMA PJ UTD *</label>
                  <input 
                    type="text" 
                    placeholder="Nama lengkap penanggung jawab" 
                    value={formData.nama_pjutd || ''}
                    onChange={(e) => setFormData({ ...formData, nama_pjutd: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NAMA MADRASAH</label>
                  <input 
                    type="text" 
                    placeholder="Nama Madrasah" 
                    value={formData.nama_madrasah || ''}
                    onChange={(e) => setFormData({ ...formData, nama_madrasah: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NAMA YAYASAN</label>
                  <input 
                    type="text" 
                    placeholder="Nama Yayasan" 
                    value={formData.yayasan || ''}
                    onChange={(e) => setFormData({ ...formData, yayasan: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Badkom & Kontak */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Induk & Kontak</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>BADAN KOORDINASI (BADKOM) *</label>
                <select 
                  value={formData.badkom_id || ''} 
                  onChange={(e) => setFormData({ ...formData, badkom_id: Number(e.target.value) })}
                  required
                >
                  <option value="">-- Pilih Badkom --</option>
                  {badkoms?.map(b => (
                    <option key={b.id} value={b.id}>{b.kode_badkom} - {b.wilayah_koordinasi}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NOMOR HP</label>
                <input 
                  type="text" 
                  placeholder="Mulai dengan 62xxx" 
                  value={formData.no_hp || ''}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Wilayah & Alamat */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Wilayah Administratif</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PROVINSI</label>
                  <select 
                    value={formData.id_prov || ''} 
                    onChange={(e) => setFormData({ ...formData, id_prov: Number(e.target.value), id_kab: undefined, id_kec: undefined, id_kel: undefined })}
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KABUPATEN / KOTA</label>
                  <select 
                    value={formData.id_kab || ''} 
                    onChange={(e) => setFormData({ ...formData, id_kab: Number(e.target.value), id_kec: undefined, id_kel: undefined })}
                    disabled={!formData.id_prov}
                  >
                    <option value="">-- Pilih Kabupaten --</option>
                    {regencies.map(r => (
                      <option key={r.id} value={r.id}>{r.nama}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KECAMATAN</label>
                  <select 
                    value={formData.id_kec || ''} 
                    onChange={(e) => setFormData({ ...formData, id_kec: Number(e.target.value), id_kel: undefined })}
                    disabled={!formData.id_kab}
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.nama}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KELURAHAN / DESA</label>
                  <select 
                    value={formData.id_kel || ''} 
                    onChange={(e) => setFormData({ ...formData, id_kel: Number(e.target.value) })}
                    disabled={!formData.id_kec}
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>{v.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ALAMAT DETAIL</label>
                <textarea 
                  placeholder="Nama jalan, gedung, RT/RW" 
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={() => setIsModalOpen(false)}
              style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail PJ UTD */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail PJ-UTD & Riwayat Penugasan"
        maxWidth="800px"
      >
        {selectedPjutd && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Profil Lembaga</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kode / Nama Lembaga</span>
                    <span style={{ fontWeight: 500 }}>{selectedPjutd.kode_lembaga} - {selectedPjutd.nama_pjutd}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nama Madrasah</span>
                    <span style={{ fontWeight: 500 }}>{selectedPjutd.nama_madrasah || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Yayasan</span>
                    <span style={{ fontWeight: 500 }}>{selectedPjutd.yayasan || '-'}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Kontak & Afiliasi</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Badan Koordinasi (Badkom)</span>
                    <span style={{ fontWeight: 500 }}>{selectedPjutd.badkom?.kode_badkom} ({selectedPjutd.badkom?.wilayah_koordinasi})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nomor HP</span>
                    <span style={{ fontWeight: 500 }}>{selectedPjutd.no_hp || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Alamat Lengkap</span>
                    <span style={{ fontWeight: 500 }}>{selectedPjutd.alamat || 'Alamat belum diisi'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 20px', background: '#f8fafc', margin: 0, borderBottom: '1px solid #e2e8f0' }}>Riwayat Ustadz Tugas Daerah (UT-D)</h3>
              {selectedPjutd.utds && selectedPjutd.utds.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '12px 20px', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Tahun Ajaran</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Nama UTD (Santri)</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>NIS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPjutd.utds.map((utd) => (
                      <tr key={utd.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.875rem', fontWeight: 500 }}>
                          {utd.tahun_ajaran?.nama_tahun_ajaran || '-'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.875rem', fontWeight: 500 }}>
                          {utd.santri?.nama || '-'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.875rem' }}>
                          {utd.santri?.nis || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Belum ada riwayat UTD di lembaga ini.
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

export default PjutdPage;
