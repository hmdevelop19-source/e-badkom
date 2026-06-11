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
          padding: 16px 20px;
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
          padding: 8px 16px 8px 40px;
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
          overflow-y: hidden;
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          min-width: 800px;
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

        .action-btn.edit { color: #64748b; }
        .action-btn.edit:hover { background: #f1f5f9; color: #0f172a; }

        .action-btn.delete { color: #ef4444; }
        .action-btn.delete:hover { background: #fee2e2; }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all text-sm"
            placeholder="Cari badkom..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <ActionDropdown
            label="Template"
            icon={<FileText size={16} />}
            buttonStyle={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}
            items={[
              { label: 'Template CSV', icon: <FileText size={14} />, onClick: handleDownloadTemplate },
              { label: 'Template Excel', icon: <FileSpreadsheet size={14} />, onClick: handleDownloadTemplateExcel }
            ]}
          />
          <ActionDropdown
            label="Export"
            icon={<Download size={16} />}
            buttonStyle={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
            items={[
              { label: 'Export CSV', icon: <FileText size={14} />, onClick: handleExport },
              { label: 'Export Excel', icon: <FileSpreadsheet size={14} />, onClick: handleExportExcel }
            ]}
          />
          <ActionDropdown
            label="Import"
            icon={<Upload size={16} />}
            buttonStyle={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
            items={[
              { label: 'Import CSV', icon: <FileText size={14} />, onClick: () => fileInputRef.current?.click() },
              { label: 'Import Excel', icon: <FileSpreadsheet size={14} />, onClick: () => excelInputRef.current?.click() }
            ]}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleImport}
          />
          <input
            type="file"
            ref={excelInputRef}
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
          />
          <button className="flex items-center gap-2 bg-[#422F6F] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow w-full md:w-auto justify-center" onClick={() => { setFormData(initialFormState); setIsModalOpen(true); }}>
            <Building2 size={16} />
            Tambah Badkom
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Wilayah Koordinasi</th>
              <th>Nama PJ</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
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
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: '#334155' }}>
                  <span style={{ padding: '4px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.75rem' }}>{b.kode_badkom}</span>
                </td>
                <td style={{ fontWeight: 500, color: '#0f172a' }}>{b.wilayah_koordinasi}</td>
                <td style={{ color: '#475569' }}>{b.nama_pj}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(b)}
                      title="Edit Badkom"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(b.id)}
                      title="Hapus Badkom"
                    >
                      <Trash2 size={18} />
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
                <label className="form-label">KODE BADKOM *</label>
                <input 
                  type="text" 
                  placeholder="Misal: BDK-01" 
                  value={formData.kode_badkom || ''}
                  onChange={(e) => setFormData({ ...formData, kode_badkom: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">CAKUPAN WILAYAH KOORDINASI *</label>
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
                <label className="form-label">NAMA LENGKAP PJ *</label>
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
                  <label className="form-label">ALAMAT EMAIL</label>
                  <input 
                    type="email" 
                    placeholder="email@contoh.com" 
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label">NOMOR HP / WHATSAPP</label>
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
                <label className="form-label">ALAMAT KANTOR / BADKOM</label>
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
