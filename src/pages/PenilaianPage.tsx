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
    nama_madrasah?: string;
    yayasan?: string;
  };
  tahun_ajaran?: {
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

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const isPenilaianOpened = settings.find((s: any) => s.key === 'is_penilaian_opened')?.value === 'true';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Penilaian UT-D</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Kelola dan evaluasi kinerja Ustadz Tugas</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Cari santri atau lokasi..." 
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
                <option value="">Tahun Ajaran Aktif</option>
                {tahunAjarans.map((ta: any) => (
                  <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!isPenilaianOpened && (
          <div style={{ padding: '16px', background: '#fff3cd', color: '#856404', borderRadius: '8px', border: '1px solid #ffeeba', fontSize: '0.875rem', marginBottom: '24px' }}>
            <strong>Informasi:</strong> Akses penilaian saat ini sedang ditutup. Penilaian hanya dapat dilakukan pada bulan terakhir tahun ajaran.
          </div>
        )}
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
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{utd.pjutd?.nama_madrasah || utd.pjutd?.yayasan || utd.pjutd?.nama_pjutd}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kode: {utd.pjutd?.kode_lembaga}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {utd.penilaian ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          {utd.penilaian.keterangan === 'Lulus' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#ecfdf5', color: '#10b981', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                              <CheckCircle size={14} /> Lulus
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#fef2f2', color: '#ef4444', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                              <XCircle size={14} /> Tidak Lulus
                            </span>
                          )}
                          
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            background: getPredikatStyles(utd.penilaian.predikat).bg,
                            color: getPredikatStyles(utd.penilaian.predikat).text,
                            border: `1px solid ${getPredikatStyles(utd.penilaian.predikat).border}`
                          }}>
                            Predikat {utd.penilaian.predikat}
                          </span>
                        </div>
                        {utd.penilaian.catatan && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '6px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                            <FileText size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                            <span style={{ lineHeight: '1.4' }}>{utd.penilaian.catatan}</span>
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
                        className={`btn ${utd.penilaian ? '' : 'btn-primary'}`} 
                        style={{ 
                          padding: '8px 12px', 
                          background: utd.penilaian ? '#f1f5f9' : undefined, 
                          color: utd.penilaian ? '#475569' : undefined,
                          opacity: !isPenilaianOpened ? 0.5 : 1,
                          cursor: !isPenilaianOpened ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => openPenilaianModal(utd)}
                        disabled={!isPenilaianOpened}
                        title={!isPenilaianOpened ? "Penilaian sedang ditutup" : ""}
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
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Lokasi: {selectedUtd.pjutd?.nama_madrasah || selectedUtd.pjutd?.yayasan || selectedUtd.pjutd?.nama_pjutd}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Keterangan Lulus <span style={{ color: 'red' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['Lulus', 'Tidak Lulus'].map((ket) => (
                  <div 
                    key={ket}
                    onClick={() => setFormData({...formData, keterangan: ket as 'Lulus' | 'Tidak Lulus'})}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: formData.keterangan === ket ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                      background: formData.keterangan === ket ? 'rgba(79, 70, 229, 0.05)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      fontWeight: 600,
                      color: formData.keterangan === ket ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      border: formData.keterangan === ket ? '5px solid var(--primary)' : '2px solid #cbd5e1',
                      background: 'white',
                      transition: 'all 0.2s'
                    }} />
                    {ket === 'Lulus' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {ket}
                  </div>
                ))}
              </div>
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
