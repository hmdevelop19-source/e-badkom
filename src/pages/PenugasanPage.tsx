import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { MapPin, Search, Edit2, Trash2, Printer } from 'lucide-react';
import toast from "react-hot-toast";
import { useDialog } from "../contexts/DialogContext";
import Modal from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { TablePagination } from '../components/TablePagination';

interface Utd {
  id: number;
  santri_id: number;
  pjutd_id: number;
  tahun_ajaran_id: number;
  tahun_ajaran?: {
    id: number;
    nama_tahun_ajaran: string;
    is_active: boolean;
  };
  santri?: {
    id: number;
    nis: string;
    nama: string;
  };
  pjutd?: {
    id: number;
    nama_pjutd: string;
    nama_madrasah?: string;
    yayasan?: string;
    kode_lembaga?: string;
  };
}

const PenugasanPage: React.FC = () => {
  const { showConfirm } = useDialog();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>('');
  const [formData, setFormData] = useState<{id?: number, santri_ids: (number | undefined)[], pjutd_id?: number}>({ santri_ids: [undefined], pjutd_id: undefined });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isWilayah = currentUser?.level === 'badkom_wilayah';

  const { data: tahunAjarans = [] } = useQuery({
    queryKey: ['tahun-ajaran'],
    queryFn: async () => {
      const response = await api.get('/tahun-ajaran');
      return response.data;
    }
  });

  const { data: utds = [], isLoading } = useQuery<Utd[]>({
    queryKey: ['utd', selectedTahunAjaranId],
    queryFn: async () => {
      const params = selectedTahunAjaranId ? { tahun_ajaran_id: selectedTahunAjaranId } : {};
      const response = await api.get('/utd', { params });
      return response.data;
    }
  });

  const { data: santris = [] } = useQuery({
    queryKey: ['santri-list'],
    queryFn: async () => {
      const response = await api.get('/santri');
      return response.data;
    }
  });

  const { data: pjutds = [] } = useQuery({
    queryKey: ['pjutd-list'],
    queryFn: async () => {
      const response = await api.get('/pjutd');
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/utd/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utd'] });
    },
    onError: () => {
      toast.error('Gagal menghapus penugasan.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pjutd_id || formData.santri_ids.some(id => !id)) {
      setError('Semua field Santri dan PJ UTD harus diisi');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (formData.id) {
        await api.put(`/utd/${formData.id}`, { santri_id: formData.santri_ids[0], pjutd_id: formData.pjutd_id });
      } else {
        await Promise.all(formData.santri_ids.map(s_id => 
          api.post('/utd', { santri_id: s_id, pjutd_id: formData.pjutd_id })
        ));
      }
      queryClient.invalidateQueries({ queryKey: ['utd'] });
      setIsModalOpen(false);
      setFormData({ santri_ids: [undefined], pjutd_id: undefined });
      toast.success('Penugasan berhasil disimpan');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan penugasan. Pastikan santri belum ditugaskan di tempat lain.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUtds = utds.filter(utd => 
    utd.santri?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utd.santri?.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utd.pjutd?.nama_pjutd.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (utd.pjutd?.nama_madrasah || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (utd.pjutd?.yayasan || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUtds.length / itemsPerPage);
  const paginatedUtds = filteredUtds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTahunAjaranId]);

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
          flex-wrap: nowrap;
          align-items: center;
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

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all text-sm"
            placeholder="Cari penugasan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={selectedTahunAjaranId}
            onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
            className="w-full md:w-auto min-w-[200px] rounded-full px-4 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all cursor-pointer"
          >
            <option value="">Tahun Ajaran Aktif</option>
            {tahunAjarans.map((ta: any) => (
              <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
            ))}
          </select>
          <button 
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all w-full md:w-auto border border-slate-200" 
            onClick={async () => {
              try {
                const url = `/cetak/penugasan${selectedTahunAjaranId ? '?tahun_ajaran_id=' + selectedTahunAjaranId : ''}`;
                // Cast skipToast since we added it to interceptor config
                const response = await api.get(url, { responseType: 'blob', skipToast: true } as any);
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, '_blank');
              } catch (error) {
                toast.error('Gagal membuat PDF');
              }
            }}
          >
            <Printer size={16} />
            Cetak Penempatan
          </button>
          {!isWilayah && (
            <button className="flex items-center gap-2 bg-[#422F6F] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow w-full md:w-auto justify-center" onClick={() => { setFormData({ santri_ids: [undefined], pjutd_id: undefined }); setIsModalOpen(true); setError(''); }}>
              <MapPin size={16} />
              Tambah Penugasan
            </button>
          )}
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Santri</th>
              <th>Lokasi PJ UTD</th>
              <th>Tahun Ajaran</th>
              {!isWilayah && <th className="text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedUtds.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data penugasan</td>
              </tr>
            ) : (
              paginatedUtds.map((utd) => (
                <tr key={utd.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{utd.santri?.nama}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NIS: {utd.santri?.nis}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{utd.pjutd?.nama_madrasah || utd.pjutd?.yayasan || utd.pjutd?.nama_pjutd}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Kode: {utd.pjutd?.kode_lembaga}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{utd.tahun_ajaran?.nama_tahun_ajaran}</div>
                    {utd.tahun_ajaran && !utd.tahun_ajaran.is_active && (
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '4px', display: 'inline-block' }}>Arsip</span>
                    )}
                  </td>
                  {!isWilayah && (
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button 
                          className="action-btn edit"
                          onClick={() => {
                            setFormData({ id: utd.id, santri_ids: [utd.santri_id], pjutd_id: utd.pjutd_id });
                            setIsModalOpen(true);
                            setError('');
                          }}
                          title="Edit Penugasan"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => {
                            showConfirm('Apakah Anda yakin ingin menghapus penugasan ini?', () => {
                              deleteMutation.mutate(utd.id);
                            });
                          }}
                          title="Hapus Penugasan"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUtds.length}
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
        title={formData.id ? "Edit Penugasan" : "Tambah Penugasan"}
        overflowVisible={true}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formData.santri_ids.map((s_id, index) => (
              <div className="form-group" key={index} style={{ marginBottom: 0 }}>
                <label className="form-label">Santri {formData.santri_ids.length > 1 ? index + 1 : ''}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <SearchableSelect 
                      options={santris
                        .filter((s: any) => !utds.some(u => u.santri_id === s.id) || s.id === s_id)
                        .map((s: any) => ({ value: s.id, label: `${s.nis} - ${s.nama}` }))}
                      value={s_id}
                      onChange={(val) => {
                        const newIds = [...formData.santri_ids];
                        newIds[index] = Number(val);
                        setFormData({...formData, santri_ids: newIds});
                      }}
                      placeholder="-- Cari dan Pilih Santri --"
                      required
                    />
                  </div>
                  {!formData.id && formData.santri_ids.length > 1 && (
                    <button type="button" className="btn" style={{ background: '#fef2f2', color: '#ef4444', padding: '0 12px' }} onClick={() => {
                      const newIds = [...formData.santri_ids];
                      newIds.splice(index, 1);
                      setFormData({...formData, santri_ids: newIds});
                    }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!formData.id && (
              <button type="button" className="btn" style={{ background: '#ffffff', border: '1px dashed #cbd5e1', color: '#475569', alignSelf: 'flex-start', fontSize: '0.875rem' }} onClick={() => {
                setFormData({...formData, santri_ids: [...formData.santri_ids, undefined]});
              }}>
                + Tambah Santri Lain
              </button>
            )}

            <div className="form-group" style={{ marginBottom: 0, marginTop: '8px' }}>
              <label className="form-label">PJ UTD (Lokasi Tugas)</label>
              <SearchableSelect 
                options={pjutds
                  .map((p: any) => ({ value: p.id, label: `${p.kode_lembaga} - ${p.nama_madrasah || p.yayasan || p.nama_pjutd}` }))}
                value={formData.pjutd_id}
                onChange={(val) => setFormData({...formData, pjutd_id: Number(val)})}
                placeholder="-- Cari dan Pilih PJ UTD --"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PenugasanPage;
