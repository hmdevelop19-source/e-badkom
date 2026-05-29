import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Award, Search, Edit2, FileText, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';

interface Penilaian {
  id?: number;
  utd_id: number;
  keterangan: 'Lulus' | 'Tidak Lulus';
  predikat: 'A' | 'B' | 'C' | 'D';
  catatan?: string;
  status_badkom_pusat?: string;
}

interface Utd {
  id: number;
  santri_id: number;
  pjutd_id: number;
  tahun_ajaran_id: number;
  santri?: {
    id: number;
    nis: string;
    nama: string;
  };
  pjutd?: {
    id: number;
    kode_lembaga: string;
    nama_pjutd: string;
  };
  tahunAjaran?: {
    id: number;
    nama_tahun_ajaran: string;
    is_active: boolean;
  };
  penilaian?: Penilaian;
}

const PenilaianPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';
  const canEdit = ['admin', 'badkom_wilayah'].includes(level);

  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>('');
  const [selectedUtd, setSelectedUtd] = useState<Utd | null>(null);
  
  const [formData, setFormData] = useState<Partial<Penilaian>>({ keterangan: 'Lulus', predikat: 'A', catatan: '' });
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const mutation = useMutation({
    mutationFn: (data: Partial<Penilaian>) => {
      return api.post('/penilaian', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utd'] });
      setIsModalOpen(false);
      setFormData({ keterangan: 'Lulus', predikat: 'A', catatan: '' });
      setSelectedUtd(null);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan penilaian.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUtd) return;
    
    mutation.mutate({
      ...formData,
      utd_id: selectedUtd.id
    });
  };

  const openPenilaianModal = (utd: Utd) => {
    setSelectedUtd(utd);
    if (utd.penilaian) {
      setFormData({
        keterangan: utd.penilaian.keterangan,
        predikat: utd.penilaian.predikat,
        catatan: utd.penilaian.catatan || ''
      });
    } else {
      setFormData({ keterangan: 'Lulus', predikat: 'A', catatan: '' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const filteredUtds = utds.filter(utd => 
    utd.santri?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utd.santri?.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utd.pjutd?.nama_pjutd.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Cari santri atau lokasi PJ UTD..." 
            style={{ paddingLeft: '40px' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="form-control"
            value={selectedTahunAjaranId}
            onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">Tahun Ajaran Aktif</option>
            {tahunAjarans.map((ta: any) => (
              <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Santri</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lokasi Tugas</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Penilaian</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
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
                <tr key={utd.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{utd.santri?.nama}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>NIS: {utd.santri?.nis}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{utd.pjutd?.nama_pjutd}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kode: {utd.pjutd?.kode_lembaga}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {utd.penilaian ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {utd.penilaian.keterangan === 'Lulus' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#ecfdf5', color: '#10b981', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
                              <CheckCircle size={14} /> Lulus
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#fef2f2', color: '#ef4444', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
                              <XCircle size={14} /> Tidak Lulus
                            </span>
                          )}
                          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                            Predikat {utd.penilaian.predikat}
                          </span>
                        </div>
                        {utd.penilaian.catatan && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={12} /> {utd.penilaian.catatan}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>Belum dinilai</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {canEdit ? (
                      <button 
                        className={`btn ${utd.penilaian ? '' : 'btn-primary'}`} 
                        style={{ 
                          padding: '8px 12px', 
                          background: utd.penilaian ? '#f1f5f9' : undefined, 
                          color: utd.penilaian ? '#475569' : undefined 
                        }}
                        onClick={() => openPenilaianModal(utd)}
                      >
                        {utd.penilaian ? (
                          <>
                            <Edit2 size={16} /> Edit Nilai
                          </>
                        ) : (
                          <>
                            <Award size={16} /> Beri Nilai
                          </>
                        )}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>View Only</span>
                    )}
                  </td>
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
        title={selectedUtd?.penilaian ? "Edit Penilaian" : "Beri Penilaian"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {selectedUtd && (
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Menilai Santri:</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedUtd.santri?.nama} ({selectedUtd.santri?.nis})</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Lokasi: {selectedUtd.pjutd?.nama_pjutd}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Keterangan</label>
              <select 
                className="form-control" 
                value={formData.keterangan || 'Lulus'}
                onChange={e => setFormData({...formData, keterangan: e.target.value as 'Lulus' | 'Tidak Lulus'})}
                required
              >
                <option value="Lulus">Lulus</option>
                <option value="Tidak Lulus">Tidak Lulus</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Predikat</label>
              <select 
                className="form-control" 
                value={formData.predikat || 'A'}
                onChange={e => setFormData({...formData, predikat: e.target.value as 'A'|'B'|'C'|'D'})}
                required
              >
                <option value="A">A (Sangat Baik)</option>
                <option value="B">B (Baik)</option>
                <option value="C">C (Cukup)</option>
                <option value="D">D (Kurang)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan (Opsional)</label>
            <textarea 
              className="form-control" 
              placeholder="Tambahkan catatan evaluasi..."
              value={formData.catatan || ''} 
              onChange={e => setFormData({...formData, catatan: e.target.value})}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Nilai'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PenilaianPage;
