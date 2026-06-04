import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { RefreshCcw, Plus, AlertCircle } from 'lucide-react';
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

interface Penarikan {
  id: number;
  utd_id: number;
  asal_pjutd_id: number;
  alasan: string;
  tanggal_penarikan: string;
  status_penyelesaian: string;
  diproses_oleh: number;
  utd: Utd;
  pjutd: Pjutd;
  user: any;
  created_at: string;
}

const PenarikanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    utd_id: '',
    alasan: '',
    tanggal_penarikan: new Date().toISOString().split('T')[0]
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

  // Fetch penarikan list
  const { data: penarikanList = [], isLoading } = useQuery<Penarikan[]>({
    queryKey: ['penarikan'],
    queryFn: async () => {
      const res = await api.get('/penarikan');
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



  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('/penarikan', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penarikan'] });
      queryClient.invalidateQueries({ queryKey: ['utd'] });
      setIsModalOpen(false);
      setFormData({ utd_id: '', alasan: '', tanggal_penarikan: new Date().toISOString().split('T')[0] });
      toast.success('Penarikan berhasil diproses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat memproses penarikan');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const filteredPenarikan = penarikanList.filter(m => 
    m.utd?.santri?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alasan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPenarikan.length / itemsPerPage);
  const paginatedPenarikan = filteredPenarikan.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filter UTD for Wilayah
  const availableUtd = utdList.filter(u => {
    if (isWilayah) {
      return u.pjutd?.badkom_id === currentUser.badkom_id;
    }
    return true;
  });


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
          flex-wrap: nowrap;
          align-items: center;
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
      `}</style>

      <div className="page-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', borderRadius: '12px' }}>
            <RefreshCcw size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Riwayat Penarikan Tugas</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Daftar penarikan tugas ustadz/ustadzah daerah</p>
          </div>
        </div>
        <div className="action-buttons">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Cari nama atau alasan..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ borderRadius: '30px', padding: '10px 24px', boxShadow: '0 4px 12px rgba(66, 47, 111, 0.2)' }}>
            <Plus size={18} /> Ajukan Penarikan
          </button>
        </div>
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
                <th>Alasan</th>
                <th>Diproses Oleh</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPenarikan.map((penarikan) => (
                <tr key={penarikan.id}>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{new Date(penarikan.tanggal_penarikan).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{penarikan.utd?.santri?.nama}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NIS: {penarikan.utd?.santri?.nis}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#b91c1c', background: '#fef2f2', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      {penarikan.pjutd?.nama_madrasah || penarikan.pjutd?.yayasan || penarikan.pjutd?.nama_pjutd}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={penarikan.alasan}>
                      {penarikan.alasan}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{penarikan.user?.fullname || penarikan.user?.username}</td>
                </tr>
              ))}
              {paginatedPenarikan.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    Belum ada riwayat penarikan
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredPenarikan.length > 0 && (
            <div style={{ padding: '0 24px 24px 24px' }}>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPenarikan.length}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Formulir Penarikan Ustadz Tugas">
        {!activeTahunAjaran ? (
          <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            Tidak ada Tahun Ajaran aktif. Tidak bisa melakukan penarikan.
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
              <label className="form-label">Tanggal Penarikan</label>
              <input 
                type="date" 
                className="form-control" 
                required 
                value={formData.tanggal_penarikan}
                onChange={e => setFormData({...formData, tanggal_penarikan: e.target.value})}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alasan Penarikan</label>
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
                {submitMutation.isPending ? 'Memproses...' : 'Proses Penarikan'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default PenarikanPage;
