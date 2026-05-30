import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { RefreshCcw, Plus, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';
import toast from 'react-hot-toast';

interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
}

interface Santri {
  id: number;
  nama_lengkap: string;
  nik: string;
}

interface Pjutd {
  id: number;
  nama_pjutd: string;
  yayasan: string;
  badkom_id?: number;
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
  diproses_oleh: number;
  utd: Utd;
  asalPjutd: Pjutd;
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
    m.utd?.santri?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCcw size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 style={{ margin: 0 }}>Riwayat Penarikan Tugas</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Daftar kepindahan tugas ustadz/ustadzah daerah</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Cari nama atau alasan..." 
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '250px' }}
          />
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Ajukan Penarikan
          </button>
        </div>
      </div>

      {isLoading ? <p>Memuat data...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Tanggal</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Ustadz Tugas</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Lembaga Asal</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Alasan</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Diproses Oleh</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPenarikan.map((penarikan) => (
                <tr key={penarikan.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px' }}>{new Date(penarikan.tanggal_penarikan).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{penarikan.utd?.santri?.nama_lengkap}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIK: {penarikan.utd?.santri?.nik}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#ef4444' }}>{penarikan.asalPjutd?.nama_pjutd}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={penarikan.alasan}>
                      {penarikan.alasan}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{penarikan.user?.name}</td>
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
            <div style={{ marginTop: '24px' }}>
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
            <div className="form-group">
              <label className="form-label">Pilih Ustadz Tugas (Yang Sedang Bertugas)</label>
              <select 
                className="form-control" 
                required 
                value={formData.utd_id}
                onChange={e => setFormData({...formData, utd_id: e.target.value})}
              >
                <option value="">-- Pilih Ustadz --</option>
                {availableUtd.map(u => (
                  <option key={u.id} value={u.id}>{u.santri?.nama_lengkap} - (Lembaga Saat Ini: {u.pjutd?.nama_pjutd})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Penarikan</label>
              <input 
                type="date" 
                className="form-control" 
                required 
                value={formData.tanggal_penarikan}
                onChange={e => setFormData({...formData, tanggal_penarikan: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alasan Penarikan</label>
              <textarea 
                className="form-control" 
                rows={4} 
                required 
                placeholder="Jelaskan alasan pemindahan tugas secara detail..."
                value={formData.alasan}
                onChange={e => setFormData({...formData, alasan: e.target.value})}
              />
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
