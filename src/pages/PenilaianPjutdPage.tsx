import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Award, Search, Edit2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';

interface PenilaianPjutd {
  id?: number;
  pjutd_id: number;
  tahun_ajaran_id: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatan?: string;
}

interface Pjutd {
  id: number;
  kode_lembaga: string;
  nama_pjutd: string;
  badkom?: {
    id: number;
    nama_pj: string;
  };
  penilaian_pjutds?: PenilaianPjutd[];
}

const PenilaianPjutdPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';
  const canEdit = ['admin', 'badkom_wilayah', 'badkom_pusat'].includes(level);

  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>('');
  const [selectedPjutd, setSelectedPjutd] = useState<Pjutd | null>(null);
  
  const [formData, setFormData] = useState<Partial<PenilaianPjutd>>({ predikat: 'A', catatan: '' });
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

  const { data: pjutds = [], isLoading } = useQuery<Pjutd[]>({
    queryKey: ['penilaian-pjutd', selectedTahunAjaranId],
    queryFn: async () => {
      const params = selectedTahunAjaranId ? { tahun_ajaran_id: selectedTahunAjaranId } : {};
      const response = await api.get('/penilaian-pjutd', { params });
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<PenilaianPjutd>) => {
      return api.post('/penilaian-pjutd', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian-pjutd'] });
      setIsModalOpen(false);
      setFormData({ predikat: 'A', catatan: '' });
      setSelectedPjutd(null);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan penilaian.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPjutd || !selectedTahunAjaranId) {
        setError('Pilih Tahun Ajaran terlebih dahulu');
        return;
    }
    
    mutation.mutate({
      ...formData,
      pjutd_id: selectedPjutd.id,
      tahun_ajaran_id: parseInt(selectedTahunAjaranId)
    });
  };

  const openPenilaianModal = (pjutd: Pjutd) => {
    if (!selectedTahunAjaranId) {
        toast.error('Silakan pilih Tahun Ajaran aktif terlebih dahulu dari dropdown pencarian.');
        return;
    }
    setSelectedPjutd(pjutd);
    
    const existingPenilaian = pjutd.penilaian_pjutds?.[0];
    if (existingPenilaian) {
      setFormData({
        predikat: existingPenilaian.predikat,
        catatan: existingPenilaian.catatan || ''
      });
    } else {
      setFormData({ predikat: 'A', catatan: '' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const filteredPjutds = pjutds.filter(p => 
    p.nama_pjutd.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kode_lembaga.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPjutds.length / itemsPerPage);
  const paginatedPjutds = filteredPjutds.slice(
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
            placeholder="Cari kode atau nama PJ UTD..." 
            style={{ paddingLeft: '40px', width: '100%' }} 
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
            <option value="">-- Pilih Tahun Ajaran --</option>
            {tahunAjarans.map((ta: any) => (
              <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTahunAjaranId && (
        <div style={{ background: '#fef9c3', padding: '16px', borderRadius: '8px', color: '#854d0e', border: '1px solid #fef08a' }}>
          Silakan pilih Tahun Ajaran dari dropdown di atas untuk melihat atau mengisi penilaian PJ UTD.
        </div>
      )}

      {selectedTahunAjaranId && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>PJ UTD</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Badkom Wilayah</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hasil Penilaian</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
                </tr>
              ) : paginatedPjutds.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data PJ UTD</td>
                </tr>
              ) : (
                paginatedPjutds.map((pjutd) => {
                  const penilaian = pjutd.penilaian_pjutds?.[0];
                  
                  return (
                    <tr key={pjutd.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pjutd.nama_pjutd}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kode: {pjutd.kode_lembaga}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pjutd.badkom?.nama_pj}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {penilaian ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                                Predikat {penilaian.predikat}
                              </span>
                            </div>
                            {penilaian.catatan && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FileText size={12} /> {penilaian.catatan}
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
                            className={`btn ${penilaian ? '' : 'btn-primary'}`} 
                            style={{ 
                              padding: '8px 12px', 
                              background: penilaian ? '#f1f5f9' : undefined, 
                              color: penilaian ? '#475569' : undefined 
                            }}
                            onClick={() => openPenilaianModal(pjutd)}
                          >
                            {penilaian ? (
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
                  );
                })
              )}
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPjutd?.penilaian_pjutds?.[0] ? "Edit Nilai PJ UTD" : "Beri Nilai PJ UTD"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>PJ UTD:</div>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedPjutd?.nama_pjutd}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kode: {selectedPjutd?.kode_lembaga}</div>
          </div>

          <div>
            <label className="form-label">Predikat <span style={{ color: 'red' }}>*</span></label>
            <select 
              className="form-control"
              value={formData.predikat}
              onChange={(e) => setFormData({...formData, predikat: e.target.value as any})}
              required
            >
              <option value="A">A (Sangat Baik)</option>
              <option value="B">B (Baik)</option>
              <option value="C">C (Cukup)</option>
              <option value="D">D (Kurang)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Catatan Evaluasi</label>
            <textarea 
              className="form-control"
              value={formData.catatan}
              onChange={(e) => setFormData({...formData, catatan: e.target.value})}
              placeholder="Berikan catatan evaluasi jika diperlukan..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="btn" 
              style={{ background: '#f1f5f9', color: '#475569' }}
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Penilaian'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PenilaianPjutdPage;
