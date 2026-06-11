import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { RefreshCcw, Plus, AlertCircle, Search } from 'lucide-react';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';
import toast from 'react-hot-toast';
import { SearchableSelect } from '../components/SearchableSelect';

interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
}

interface Santri {
  id: number;
  nama: string;
  nik: string;
  nis: string;
}

interface Pjutd {
  id: number;
  nama_pjutd: string;
  yayasan: string;
  badkom_id?: number;
  nama_madrasah?: string;
  kode_lembaga?: string;
}

interface Utd {
  id: number;
  santri_id: number;
  pjutd_id: number;
  tahun_ajaran_id: number;
  santri: Santri;
  pjutd: Pjutd;
}

interface Mutasi {
  id: number;
  utd_id: number;
  asal_pjutd_id: number;
  tujuan_pjutd_id: number;
  alasan: string;
  tanggal_mutasi: string;
  status_penyelesaian: string;
  diproses_oleh: number;
  utd: Utd;
  asal_pjutd: Pjutd;
  tujuan_pjutd: Pjutd;
  user: any;
  created_at: string;
}

const MutasiPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    utd_id: '',
    tujuan_pjutd_id: '',
    alasan: '',
    tanggal_mutasi: new Date().toISOString().split('T')[0]
  });

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isWilayah = currentUser?.level === 'badkom_wilayah';

  // Fetch active tahun ajaran
  const { data: tahunAjaranList = [] } = useQuery<TahunAjaran[]>({
    queryKey: ['tahun_ajaran'],
    queryFn: async () => {
      const res = await api.get('/tahun-ajaran');
      return res.data;
    }
  });

  const activeTahunAjaran = tahunAjaranList.find(t => t.is_active);

  // Fetch mutasi list
  const { data: mutasiList = [], isLoading } = useQuery<Mutasi[]>({
    queryKey: ['mutasi'],
    queryFn: async () => {
      const res = await api.get('/mutasi');
      return res.data;
    }
  });

  // Fetch utd (penugasan) for dropdown
  const { data: utdList = [] } = useQuery<Utd[]>({
    queryKey: ['utd', activeTahunAjaran?.id],
    queryFn: async () => {
      const res = await api.get(`/utd?tahun_ajaran_id=${activeTahunAjaran?.id}`);
      return res.data;
    },
    enabled: !!activeTahunAjaran && isModalOpen
  });

  // Fetch pjutd (lembaga) for dropdown
  const { data: pjutdList = [] } = useQuery<Pjutd[]>({
    queryKey: ['pjutd'],
    queryFn: async () => {
      const res = await api.get('/pjutd');
      return res.data;
    },
    enabled: isModalOpen
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('/mutasi', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mutasi'] });
      queryClient.invalidateQueries({ queryKey: ['utd'] });
      setIsModalOpen(false);
      setFormData({ utd_id: '', tujuan_pjutd_id: '', alasan: '', tanggal_mutasi: new Date().toISOString().split('T')[0] });
      toast.success('Mutasi berhasil diproses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat memproses mutasi');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const filteredMutasi = mutasiList.filter(m => 
    m.utd?.santri?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alasan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMutasi.length / itemsPerPage);
  const paginatedMutasi = filteredMutasi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const availableTujuanPjutd = pjutdList.filter(p => {
    // If wilayah, only show PJUTD in their wilayah
    if (isWilayah) {
      return p.badkom_id === currentUser.badkom_id;
    }
    return true;
  });

  // Filter UTD for Wilayah
  const availableUtd = utdList.filter(u => {
    if (isWilayah) {
      return u.pjutd?.badkom_id === currentUser.badkom_id;
    }
    return true;
  });

  const selectedUtd = utdList.find(u => u.id === Number(formData.utd_id));

  return (
    <>
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
      `}</style>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <RefreshCcw size={24} />
          </div>
          <div>
            <h2 className="m-0 text-xl text-slate-900 font-bold">Riwayat Mutasi Tugas</h2>
            <p className="m-0 mt-1 text-sm text-slate-500">Daftar kepindahan tugas ustadz/ustadzah daerah</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari nama atau alasan..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[#422F6F] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow w-full md:w-auto justify-center" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Ajukan Mutasi
          </button>
        </div>
      </div>

      {isLoading ? <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data...</div> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Ustadz Tugas</th>
                <th>Lembaga Asal</th>
                <th>Lembaga Tujuan</th>
                <th>Alasan</th>
                <th>Diproses Oleh</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMutasi.map((mutasi) => (
                <tr key={mutasi.id}>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{new Date(mutasi.tanggal_mutasi).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{mutasi.utd?.santri?.nama}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NIS: {mutasi.utd?.santri?.nis}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#b91c1c', background: '#fef2f2', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      {mutasi.asal_pjutd?.nama_madrasah || mutasi.asal_pjutd?.yayasan || mutasi.asal_pjutd?.nama_pjutd}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#047857', background: '#d1fae5', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      {mutasi.tujuan_pjutd?.nama_madrasah || mutasi.tujuan_pjutd?.yayasan || mutasi.tujuan_pjutd?.nama_pjutd}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={mutasi.alasan}>
                      {mutasi.alasan}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{mutasi.user?.fullname || mutasi.user?.username}</td>
                </tr>
              ))}
              {paginatedMutasi.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    Belum ada riwayat mutasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredMutasi.length > 0 && (
            <div style={{ padding: '0 24px 24px 24px' }}>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredMutasi.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(limit) => {
                  setItemsPerPage(limit);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

    </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Formulir Mutasi Ustadz Tugas">
        {!activeTahunAjaran ? (
          <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            Tidak ada Tahun Ajaran aktif. Tidak bisa melakukan mutasi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Ustadz Tugas (Yang Sedang Bertugas)</label>
              <SearchableSelect
                options={availableUtd.map(u => ({ value: u.id, label: `${u.santri?.nama} - (Saat ini: ${u.pjutd?.nama_madrasah || u.pjutd?.yayasan || u.pjutd?.nama_pjutd})` }))}
                value={formData.utd_id ? Number(formData.utd_id) : undefined}
                onChange={(val) => setFormData({...formData, utd_id: val.toString()})}
                placeholder="-- Cari dan Pilih Ustadz --"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Lembaga Tujuan Mutasi</label>
              <SearchableSelect
                options={pjutdList.filter(p => p.id !== selectedUtd?.pjutd_id).map(p => ({ value: p.id, label: `${p.kode_lembaga} - ${p.nama_madrasah || p.yayasan || p.nama_pjutd}` }))}
                value={formData.tujuan_pjutd_id ? Number(formData.tujuan_pjutd_id) : undefined}
                onChange={(val) => setFormData({...formData, tujuan_pjutd_id: val.toString()})}
                placeholder="-- Cari dan Pilih Tujuan --"
                required
                disabled={!formData.utd_id}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Mutasi</label>
              <input 
                type="date" 
                className="form-control" 
                required 
                value={formData.tanggal_mutasi}
                onChange={e => setFormData({...formData, tanggal_mutasi: e.target.value})}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alasan Mutasi</label>
              <textarea 
                className="form-control" 
                rows={3} 
                required 
                placeholder="Jelaskan alasan pemindahan tugas secara detail..."
                value={formData.alasan}
                onChange={e => setFormData({...formData, alasan: e.target.value})}
              />
            </div>
          </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Memproses...' : 'Proses Mutasi'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default MutasiPage;
