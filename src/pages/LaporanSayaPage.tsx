import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { FileText, Plus, Search, Filter, AlertCircle, RefreshCcw, CheckCircle, Clock, Trash2, Edit3, Printer, FilePlus } from 'lucide-react';
import { CetakLaporanWajibUtd } from '../components/CetakLaporanWajibUtd';
import { CetakLaporanWajibPjutd } from '../components/CetakLaporanWajibPjutd';
import Modal from '../components/Modal';

interface Soal {
  id: number;
  target_level: string;
  pertanyaan: string;
  tipe_soal: string;
  opsi_jawaban: string[] | null;
  is_active: boolean;
}

interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
}

interface LaporanWajib {
  id: number;
  bulan_tahun: string;
  kategori_bulan: string;
  tahun_ajaran_id: number;
  status: string;
  status_waktu?: string;
  user: any;
  jawabans: any[];
  tahunAjaran?: TahunAjaran;
}

interface LaporanMendesak {
  id: number;
  judul: string;
  isi_laporan: string;
  file_lampiran: string | null;
  status_penyelesaian: string;
  tahun_ajaran_id: number;
  user: any;
  created_at: string;
  tahunAjaran?: TahunAjaran;
}



const LaporanSayaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'wajib' | 'mendesak'>('wajib');
  
  // Modals
  const [isSubmitWajibModalOpen, setIsSubmitWajibModalOpen] = useState(false);
  const [isMendesakModalOpen, setIsMendesakModalOpen] = useState(false);

  // Forms
  const [mendesakForm, setMendesakForm] = useState({ judul: '', isi_laporan: '' });
  const [jawabanForm, setJawabanForm] = useState<Record<number, string>>({});
  
  const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedKategoriBulan, setSelectedKategoriBulan] = useState('Bulan Ke-1');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | ''>('');
  const [printLaporan, setPrintLaporan] = useState<any>(null);
  const [printBlankoType, setPrintBlankoType] = useState<'utd' | 'pjutd' | null>(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const maxBulanLaporan = settings.find((s: any) => s.key === 'max_bulan_laporan')?.value || 12;
  const KATEGORI_BULAN_OPTIONS = Array.from({ length: parseInt(maxBulanLaporan) }, (_, i) => `Bulan Ke-${i + 1}`);

  useEffect(() => {
    if (printLaporan || printBlankoType) {
      setTimeout(() => window.print(), 500);
    }
  }, [printLaporan, printBlankoType]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintLaporan(null);
      setPrintBlankoType(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level;
  const isSender = level === 'utd' || level === 'pjutd' || level === 'badkom_wilayah';

  // Queries
  const { data: tahunAjaranList = [] } = useQuery<TahunAjaran[]>({
    queryKey: ['tahun_ajaran'],
    queryFn: async () => {
      const res = await api.get('/tahun-ajaran');
      return res.data;
    }
  });

  useEffect(() => {
    if (tahunAjaranList.length > 0 && selectedTahunAjaran === '') {
      const active = tahunAjaranList.find(t => t.is_active);
      if (active) setSelectedTahunAjaran(active.id);
      else setSelectedTahunAjaran(tahunAjaranList[0].id);
    }
  }, [tahunAjaranList, selectedTahunAjaran]);

  const { data: mySoal = [], isLoading: loadingMySoal } = useQuery<Soal[]>({
    queryKey: ['my_soal_laporan'],
    queryFn: async () => {
      const res = await api.get('/laporan-wajib/soal');
      return res.data;
    },
    enabled: isSender
  });

  const { data: laporanWajibList = [], isLoading: loadingWajib } = useQuery<LaporanWajib[]>({
    queryKey: ['laporan_wajib'],
    queryFn: async () => {
      const res = await api.get('/laporan-wajib');
      return res.data;
    }
  });

  const { data: laporanMendesakList = [], isLoading: loadingMendesak } = useQuery<LaporanMendesak[]>({
    queryKey: ['laporan_mendesak'],
    queryFn: async () => {
      const res = await api.get('/laporan-mendesak');
      return res.data;
    }
  });

  const { data: jadwalData = [] } = useQuery({
    queryKey: ['jadwal-laporan', selectedTahunAjaran],
    queryFn: async () => {
      if (!selectedTahunAjaran) return [];
      const res = await api.get('/jadwal-laporan-wajib', { params: { tahun_ajaran_id: selectedTahunAjaran } });
      return res.data;
    },
    enabled: !!selectedTahunAjaran
  });

  const currentJadwal = jadwalData.find((j: any) => j.kategori_bulan === selectedKategoriBulan);
  const isLate = currentJadwal ? new Date() > new Date(currentJadwal.batas_tanggal) : false;

  // Mutations
  const submitWajibMutation = useMutation({
    mutationFn: (data: any) => api.post('/laporan-wajib/submit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan_wajib'] });
      setIsSubmitWajibModalOpen(false);
    }
  });

  const submitMendesakMutation = useMutation({
    mutationFn: (data: any) => api.post('/laporan-mendesak', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan_mendesak'] });
      setIsMendesakModalOpen(false);
    }
  });

  // Handlers
  const handleWajibSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWajibMutation.mutate({
      bulan_tahun: currentMonthYear,
      kategori_bulan: selectedKategoriBulan,
      jawaban: jawabanForm
    });
  };

  const handleMendesakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMendesakMutation.mutate(mendesakForm);
  };

  // Check if current user has already submitted this month IN THE ACTIVE TAHUN AJARAN
  const activeTahunAjaran = tahunAjaranList.find(t => t.is_active);
  const hasSubmittedWajib = laporanWajibList.some(l => 
    l.user?.id === currentUser?.id && 
    l.kategori_bulan === selectedKategoriBulan && 
    l.tahun_ajaran_id === activeTahunAjaran?.id
  );

  // My Reports only, filtered by selectedTahunAjaran
  const myLaporanWajibList = laporanWajibList.filter(l => l.user?.id === currentUser?.id && l.tahun_ajaran_id === selectedTahunAjaran);
  const myLaporanMendesakList = laporanMendesakList.filter(l => l.user?.id === currentUser?.id && l.tahun_ajaran_id === selectedTahunAjaran);

  const getKopUrl = (type: 'utd' | 'pjutd') => {
    const key = type === 'utd' ? 'kop_laporan_utd' : 'kop_laporan_pjutd';
    const path = settings.find((s: any) => s.key === key)?.value;
    if (path) return import.meta.env.VITE_API_URL.replace('/api', '') + '/' + path;
    return undefined;
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Segmented Control Tabs */}
      <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '16px', gap: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
        <button 
          onClick={() => setActiveTab('wajib')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '12px', 
            background: activeTab === 'wajib' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'wajib' ? 'white' : '#64748b',
            border: 'none',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          <FileText size={18} /> Laporan Wajib (Rutin)
        </button>
        <button 
          onClick={() => setActiveTab('mendesak')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '12px', 
            background: activeTab === 'mendesak' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'mendesak' ? 'white' : '#64748b',
            border: 'none',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          <AlertCircle size={18} /> Laporan Mendesak
        </button>
      </div>

      {activeTab === 'wajib' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pengumpulan / Riwayat Saya */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Laporan Wajib Saya</h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Kirim dan pantau riwayat laporan rutin Anda</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>T.A:</span>
                  <select 
                    className="styled-input" 
                    value={selectedTahunAjaran} 
                    onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                    style={{ minWidth: '160px' }}
                  >
                    {tahunAjaranList.map(ta => (
                      <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bulan:</span>
                  <select 
                    className="styled-input" 
                    value={selectedKategoriBulan} 
                    onChange={e => setSelectedKategoriBulan(e.target.value)}
                    style={{ minWidth: '120px' }}
                  >
                    {KATEGORI_BULAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {isSender && (
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setPrintBlankoType(currentUser?.level === 'utd' ? 'utd' : 'pjutd')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    <FilePlus size={18} /> Cetak Blanko
                  </button>
                )}

                {isSender && selectedTahunAjaran === activeTahunAjaran?.id && (
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => { setJawabanForm({}); setIsSubmitWajibModalOpen(true); }}
                      disabled={hasSubmittedWajib}
                      style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center', boxShadow: hasSubmittedWajib ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.3)' }}
                    >
                      <Plus size={18} />
                      {hasSubmittedWajib ? 'Sudah Dilaporkan' : 'Isi Laporan'}
                    </button>
                    {!hasSubmittedWajib && currentJadwal && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, fontSize: '0.75rem', color: isLate ? '#ef4444' : '#64748b', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        Batas: {new Date(currentJadwal.batas_tanggal).toLocaleDateString('id-ID')} {isLate && '(Terlambat)'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loadingWajib ? <p>Memuat riwayat...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myLaporanWajibList.filter(l => l.kategori_bulan === selectedKategoriBulan).map(laporan => (
                  <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{laporan.kategori_bulan}</div> 
                          <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '2px' }}>Dikirim: {laporan.bulan_tahun}</div>
                        </div>
                        {laporan.status_waktu && (
                          <span style={{ 
                            marginLeft: '8px', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: laporan.status_waktu === 'Tepat Waktu' ? '#ecfdf5' : '#fef2f2',
                            color: laporan.status_waktu === 'Tepat Waktu' ? '#10b981' : '#ef4444',
                            border: `1px solid ${laporan.status_waktu === 'Tepat Waktu' ? '#a7f3d0' : '#fecaca'}`,
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            {laporan.status_waktu === 'Tepat Waktu' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                            {laporan.status_waktu}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, background: '#ecfdf5', padding: '8px 12px', borderRadius: '8px' }}>
                          <CheckCircle size={16} /> Terkirim
                        </span>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => setPrintLaporan(laporan)}
                          style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, borderRadius: '8px' }}
                        >
                          <Printer size={16} /> Cetak
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {laporan.jawabans.map((j: any) => (
                        <div key={j.id} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>{j.soal_laporan?.pertanyaan}</div>
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4' }}>{j.jawaban || '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {myLaporanWajibList.filter(l => l.kategori_bulan === selectedKategoriBulan).length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Belum Ada Laporan</h3>
                    <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>Anda belum mengisi laporan untuk {selectedKategoriBulan} pada Tahun Ajaran ini.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mendesak' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Laporan Mendesak</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Laporan khusus untuk kejadian luar biasa / insidental</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>T.A:</span>
                <select 
                  className="styled-input" 
                  value={selectedTahunAjaran} 
                  onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                  style={{ minWidth: '160px' }}
                >
                  {tahunAjaranList.map(ta => (
                    <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                  ))}
                </select>
              </div>
              
              {isSender && selectedTahunAjaran === activeTahunAjaran?.id && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsMendesakModalOpen(true)}
                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center', background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                >
                  <AlertCircle size={18} /> Buat Laporan Mendesak
                </button>
              )}
            </div>
          </div>

          {loadingMendesak ? <p>Memuat laporan...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myLaporanMendesakList.map(laporan => (
                <div key={laporan.id} style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  background: laporan.status_penyelesaian === 'Selesai' ? '#f8fafc' : 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{laporan.judul}</h4>
                      <div style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {new Date(laporan.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: laporan.status_penyelesaian === 'Menunggu' ? '#fee2e2' : laporan.status_penyelesaian === 'Diproses' ? '#fef3c7' : '#dcfce7',
                      color: laporan.status_penyelesaian === 'Menunggu' ? '#b91c1c' : laporan.status_penyelesaian === 'Diproses' ? '#b45309' : '#15803d',
                      border: `1px solid ${laporan.status_penyelesaian === 'Menunggu' ? '#fecaca' : laporan.status_penyelesaian === 'Diproses' ? '#fde68a' : '#bbf7d0'}`,
                      whiteSpace: 'nowrap'
                    }}>
                      {laporan.status_penyelesaian}
                    </span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {laporan.isi_laporan}
                    </p>
                  </div>
                </div>
              ))}
              {myLaporanMendesakList.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <AlertCircle size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Belum Ada Laporan Mendesak</h3>
                  <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>Anda belum membuat laporan mendesak pada Tahun Ajaran ini.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Isi Laporan Wajib */}
      <Modal isOpen={isSubmitWajibModalOpen} onClose={() => setIsSubmitWajibModalOpen(false)} title={`Isi Laporan Wajib - ${selectedKategoriBulan}`}>
        <form onSubmit={handleWajibSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loadingMySoal ? <p>Memuat pertanyaan...</p> : mySoal.length === 0 ? <p>Belum ada soal aktif untuk level Anda.</p> : (
            mySoal.map((soal, index) => (
              <div key={soal.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem' }}>
                  {index + 1}. {soal.pertanyaan}
                </label>
                {soal.tipe_soal === 'uraian' ? (
                  <textarea 
                    className="styled-input" 
                    rows={4} 
                    required 
                    onChange={e => setJawabanForm({...jawabanForm, [soal.id]: e.target.value})}
                    placeholder="Tulis jawaban Anda di sini..."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {soal.opsi_jawaban?.map((opsi, idx) => (
                      <label key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', 
                        padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                        background: 'white', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        <input 
                          type="radio" 
                          name={`soal_${soal.id}`} 
                          value={opsi} 
                          required 
                          onChange={e => setJawabanForm({...jawabanForm, [soal.id]: e.target.value})}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }}
                        />
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{opsi}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsSubmitWajibModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={mySoal.length === 0 || submitWajibMutation.isPending} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <CheckCircle size={18} /> Kirim Laporan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Isi Laporan Mendesak */}
      <Modal isOpen={isMendesakModalOpen} onClose={() => setIsMendesakModalOpen(false)} title="Buat Laporan Mendesak">
        <form onSubmit={handleMendesakSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Judul Masalah / Laporan</label>
            <input 
              type="text" 
              className="styled-input" 
              value={mendesakForm.judul}
              onChange={e => setMendesakForm({...mendesakForm, judul: e.target.value})}
              required 
              placeholder="Contoh: Atap asrama bocor..."
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Deskripsi Lengkap</label>
            <textarea 
              className="styled-input" 
              rows={6} 
              value={mendesakForm.isi_laporan}
              onChange={e => setMendesakForm({...mendesakForm, isi_laporan: e.target.value})}
              required 
              placeholder="Jelaskan secara detail mengenai kejadian tersebut..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsMendesakModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitMendesakMutation.isPending} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, background: '#ef4444', border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} /> Kirim Laporan
            </button>
          </div>
        </form>
      </Modal>

      {/* Empty block to close the main div */}
      </div>

      {/* Print Areas */}
      {(printLaporan || printBlankoType) && (
        <div className="print-area">
          {printLaporan && currentUser?.level === 'utd' && (
            <CetakLaporanWajibUtd laporan={printLaporan} kopSuratUrl={getKopUrl('utd')} />
          )}
          {printLaporan && currentUser?.level === 'pjutd' && (
            <CetakLaporanWajibPjutd laporan={printLaporan} kopSuratUrl={getKopUrl('pjutd')} />
          )}
          
          {printBlankoType === 'utd' && !printLaporan && (
            <CetakLaporanWajibUtd 
              laporan={{
                user: { fullname: currentUser?.fullname, santri: currentUser?.santri },
                jawabans: []
              }} 
              kopSuratUrl={getKopUrl('utd')} 
            />
          )}
          {printBlankoType === 'pjutd' && !printLaporan && (
            <CetakLaporanWajibPjutd 
              laporan={{
                user: { fullname: currentUser?.fullname, pjutd: currentUser?.pjutd },
                jawabans: []
              }} 
              kopSuratUrl={getKopUrl('pjutd')} 
            />
          )}
        </div>
      )}
    </>
  );
};

export default LaporanSayaPage;
