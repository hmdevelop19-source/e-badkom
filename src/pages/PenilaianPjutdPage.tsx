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
    kode_badkom: string;
    wilayah_koordinasi: string;
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

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const isPenilaianOpened = settings.find((s: any) => s.key === 'is_penilaian_opened')?.value === 'true';

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

  const getPredikatStyles = (predikat: string) => {
    switch (predikat) {
      case 'A': return { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0', label: 'A (Sangat Baik)' };
      case 'B': return { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe', label: 'B (Baik)' };
      case 'C': return { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a', label: 'C (Cukup)' };
      case 'D': return { bg: '#fef2f2', text: '#ef4444', border: '#fecaca', label: 'D (Kurang)' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: '-' };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Penilaian PJ UTD</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Kelola dan evaluasi kinerja Penanggung Jawab Daerah</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Cari kode atau nama..." 
                className="styled-input"
                style={{ paddingLeft: '40px', width: '100%' }} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>T.A:</span>
              <select 
                className="styled-input"
                value={selectedTahunAjaranId}
                onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="">-- Pilih Tahun Ajaran --</option>
                {tahunAjarans.map((ta: any) => (
                  <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedTahunAjaranId && (
        <div style={{ background: '#fef9c3', padding: '16px', borderRadius: '8px', color: '#854d0e', border: '1px solid #fef08a' }}>
          Silakan pilih Tahun Ajaran dari dropdown di atas untuk melihat atau mengisi penilaian PJ UTD.
        </div>
      )}

      {selectedTahunAjaranId && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {!isPenilaianOpened && (
            <div style={{ padding: '16px', background: '#fff3cd', color: '#856404', borderBottom: '1px solid #ffeeba', fontSize: '0.875rem' }}>
              <strong>Informasi:</strong> Akses penilaian saat ini sedang ditutup. Penilaian hanya dapat dilakukan pada bulan terakhir tahun ajaran.
            </div>
          )}
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
                      <td className="px-6 py-4">
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pjutd.nama_pjutd}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kode: {pjutd.kode_lembaga}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pjutd.badkom?.wilayah_koordinasi ? `${pjutd.badkom.kode_badkom} - ${pjutd.badkom.wilayah_koordinasi}` : pjutd.badkom?.kode_badkom || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {penilaian ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                background: getPredikatStyles(penilaian.predikat).bg,
                                color: getPredikatStyles(penilaian.predikat).text,
                                border: `1px solid ${getPredikatStyles(penilaian.predikat).border}`
                              }}>
                                Predikat {penilaian.predikat}
                              </span>
                            </div>
                            {penilaian.catatan && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '6px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                <FileText size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                                <span style={{ lineHeight: '1.4' }}>{penilaian.catatan}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ display: 'inline-block', padding: '6px 12px', background: '#f1f5f9', color: '#64748b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            Belum dinilai
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {canEdit ? (
                          <button 
                            className={`btn ${penilaian ? '' : 'btn-primary'}`} 
                            style={{ 
                              padding: '8px 12px', 
                              background: penilaian ? '#f1f5f9' : undefined, 
                              color: penilaian ? '#475569' : undefined,
                              opacity: !isPenilaianOpened ? 0.5 : 1,
                              cursor: !isPenilaianOpened ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => openPenilaianModal(pjutd)}
                            disabled={!isPenilaianOpened}
                            title={!isPenilaianOpened ? "Penilaian sedang ditutup" : ""}
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

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Predikat <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['A', 'B', 'C', 'D'].map((pred) => {
                const style = getPredikatStyles(pred);
                const isSelected = formData.predikat === pred;
                return (
                  <div 
                    key={pred}
                    onClick={() => setFormData({...formData, predikat: pred as 'A'|'B'|'C'|'D'})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${style.text}` : '1px solid #e2e8f0',
                      background: isSelected ? style.bg : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        border: isSelected ? `4px solid ${style.text}` : '2px solid #cbd5e1',
                        background: 'white',
                        transition: 'all 0.2s'
                      }} />
                      <span style={{ fontWeight: 700, color: isSelected ? style.text : 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {pred}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isSelected ? style.text : 'var(--text-secondary)', paddingLeft: '24px' }}>
                      {style.label.replace(pred + ' ', '')}
                    </div>
                  </div>
                )
              })}
            </div>
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
