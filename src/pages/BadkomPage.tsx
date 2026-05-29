import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Building2, Search, Edit2, Trash2, Upload, Download, FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '../contexts/DialogContext';
import Modal from '../components/Modal';
import { ActionDropdown } from '../components/ActionDropdown';
import { TablePagination } from '../components/TablePagination';

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
  const { showConfirm } = useDialog();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const initialFormState: Partial<Badkom> = { 
    kode_badkom: '', 
    nama_pj: '',
    email: '',
    wilayah_koordinasi: '',
    alamat: '',
    no_hp: ''
  };

  const [formData, setFormData] = useState<Partial<Badkom>>(initialFormState);
  const [error, setError] = useState('');

  const { data: badkoms, isLoading } = useQuery<Badkom[]>({
    queryKey: ['badkom'],
    queryFn: async () => {
      const response = await api.get('/badkom');
      return response.data;
    },
  });

  const filteredBadkoms = useMemo(() => {
    if (!badkoms) return [];
    return badkoms.filter(b => 
      b.kode_badkom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nama_pj.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.wilayah_koordinasi.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [badkoms, searchQuery]);

  const totalPages = Math.ceil(filteredBadkoms.length / itemsPerPage);
  const paginatedBadkoms = filteredBadkoms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const mutation = useMutation({
    mutationFn: (newBadkom: Partial<Badkom>) => {
      if (newBadkom.id) {
        return api.put(`/badkom/${newBadkom.id}`, newBadkom);
      }
      return api.post('/badkom', newBadkom);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badkom'] });
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
      return api.delete(`/badkom/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badkom'] });
    },
    onError: () => {
      toast.error('Gagal menghapus data.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    showConfirm('Apakah Anda yakin ingin menghapus data Badkom ini?', () => {
      deleteMutation.mutate(id);
    });
  };

  const handleEdit = (badkom: Badkom) => {
    setFormData(badkom);
    setIsModalOpen(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {
      const response = await api.post('/badkom/import/csv', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['badkom'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor file.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/badkom/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'badkom_export.csv');
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
      const response = await api.get('/badkom/template/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'badkom_template.csv');
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
      const response = await api.post('/badkom/import/excel', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['badkom'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor file Excel.');
    }
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/badkom/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'badkom_export.xlsx');
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
      const response = await api.get('/badkom/template/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'badkom_template.xlsx');
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
            placeholder="Cari badkom..." 
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
          <button className="btn btn-primary" onClick={() => { setFormData(initialFormState); setIsModalOpen(true); }}>
            <Building2 size={18} />
            Tambah Badkom
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kode</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Wilayah Koordinasi</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama PJ</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedBadkoms?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data badkom.</td>
              </tr>
            ) : paginatedBadkoms?.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{b.kode_badkom}</td>
                <td style={{ padding: '16px 24px' }}>{b.wilayah_koordinasi}</td>
                <td style={{ padding: '16px 24px' }}>{b.nama_pj}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleEdit(b)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} 
                      title="Edit Badkom"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(b.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} 
                      title="Hapus Badkom"
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
            totalItems={filteredBadkoms.length}
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
        title={formData.id ? "Edit Data Badkom" : "Tambah Data Badkom"}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          {/* Section: Identitas Badkom */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Identitas Badkom</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KODE BADKOM *</label>
                <input 
                  type="text" 
                  placeholder="Misal: BDK-01" 
                  value={formData.kode_badkom || ''}
                  onChange={(e) => setFormData({ ...formData, kode_badkom: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CAKUPAN WILAYAH KOORDINASI *</label>
                <input 
                  type="text" 
                  placeholder="Misal: Kecamatan A dan B" 
                  value={formData.wilayah_koordinasi || ''}
                  onChange={(e) => setFormData({ ...formData, wilayah_koordinasi: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Penanggung Jawab */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Data Penanggung Jawab (PJ)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NAMA LENGKAP PJ *</label>
                <input 
                  type="text" 
                  placeholder="Nama Lengkap Penanggung Jawab" 
                  value={formData.nama_pj || ''}
                  onChange={(e) => setFormData({ ...formData, nama_pj: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ALAMAT EMAIL</label>
                  <input 
                    type="email" 
                    placeholder="email@contoh.com" 
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NOMOR HP / WHATSAPP</label>
                  <input 
                    type="text" 
                    placeholder="Mulai dengan 62xxx" 
                    value={formData.no_hp || ''}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Alamat */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Alamat</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ALAMAT KANTOR / BADKOM</label>
                <textarea 
                  placeholder="Detail Alamat (Jalan, RT/RW, Desa)" 
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
    </div>
  );
};

export default BadkomPage;
