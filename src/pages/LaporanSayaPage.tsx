import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { FileText, Plus, Search, Filter, AlertCircle, RefreshCcw, CheckCircle, Clock, Trash2, Edit3, Printer, FilePlus } from 'lucide-react';
import { CetakLaporanWajibUtd } from '../components/CetakLaporanWajibUtd';
import { CetakLaporanWajibPjutd } from '../components/CetakLaporanWajibPjutd';
import { CetakLaporanMendesak } from '../components/CetakLaporanMendesak';
import Modal from '../components/Modal';

interface Soal {
  id: number;
  target_level: string;
  pertanyaan: string;
  tipe_soal: string;
  opsi_jawaban: string[] | null;
  is_active: boolean;
}

interface KategoriSoal {
  id: number;
  nama_kategori: string;
  soal_laporan?: Soal[];
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

  const { data: myKategoriSoal = [], isLoading: loadingMySoal } = useQuery<KategoriSoal[]>({
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
    
    // Transform jawabanForm for multi groups
    const finalJawaban: Record<string, string> = {};
    Object.keys(jawabanForm).forEach(soalId => {
      const j = (jawabanForm as any)[soalId];
      if (typeof j === 'object' && j !== null) {
        finalJawaban[soalId] = Object.entries(j).map(([k, v]) => `${k}: ${v}`).join(' | ');
      } else {
        finalJawaban[soalId] = j;
      }
    });

    submitWajibMutation.mutate({
      bulan_tahun: currentMonthYear,
      kategori_bulan: selectedKategoriBulan,
      jawaban: finalJawaban
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
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <style>{`
        .laporan-tab-btn {
          padding: 12px 24px;
          border-radius: 14px;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: #64748b;
        }
        .laporan-tab-btn:hover:not(.active) {
          background: rgba(226, 232, 240, 0.5);
          color: #334155;
        }
        .laporan-tab-btn.active.wajib {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        }
        .laporan-tab-btn.active.mendesak {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .laporan-card-header {
          background: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
          overflow: hidden;
        }
        .laporan-card-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #4f46e5, #ec4899);
          opacity: 0.8;
        }
        .laporan-mendesak-header::before {
          background: linear-gradient(90deg, #ef4444, #f59e0b);
        }
        .laporan-item-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }
        .laporan-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }
        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .action-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }
        .action-btn.primary:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
          transform: translateY(-1px);
        }
        .action-btn.primary:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }
        .action-btn.danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }
        .action-btn.danger:hover {
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
          transform: translateY(-1px);
        }
        .action-btn.outline {
          background: white;
          border-color: #e2e8f0;
          color: #475569;
        }
        .action-btn.outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }
      `}</style>
      
      {/* Segmented Control Tabs */}
      <div style={{ display: 'flex', background: '#f8fafc', padding: '8px', borderRadius: '18px', gap: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', width: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <button 
          className={`laporan-tab-btn ${activeTab === 'wajib' ? 'active wajib' : ''}`}
          onClick={() => setActiveTab('wajib')}
        >
          <FileText size={18} /> Laporan Wajib (Rutin)
        </button>
        <button 
          className={`laporan-tab-btn ${activeTab === 'mendesak' ? 'active mendesak' : ''}`}
          onClick={() => setActiveTab('mendesak')}
        >
          <AlertCircle size={18} /> Laporan Mendesak
        </button>
      </div>

      {activeTab === 'wajib' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pengumpulan / Riwayat Saya */}
          <div className="laporan-card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                  <FileText size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Laporan Wajib Saya</h2>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>Kirim dan pantau riwayat laporan rutin Anda</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>T.A:</span>
                  <select 
                    className="styled-input" 
                    value={selectedTahunAjaran} 
                    onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                    style={{ minWidth: '160px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                  >
                    {tahunAjaranList.map(ta => (
                      <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div style={{ width: '1px', height: '32px', background: '#e2e8f0', margin: '0 4px' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bulan:</span>
                  <select 
                    className="styled-input" 
                    value={selectedKategoriBulan} 
                    onChange={e => setSelectedKategoriBulan(e.target.value)}
                    style={{ minWidth: '140px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                  >
                    {KATEGORI_BULAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {isSender && (
                  <button 
                    className="action-btn outline" 
                    onClick={() => setPrintBlankoType(currentUser?.level === 'utd' ? 'utd' : 'pjutd')}
                  >
                    <FilePlus size={18} /> Cetak Blanko
                  </button>
                )}

                {isSender && selectedTahunAjaran === activeTahunAjaran?.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                    {!hasSubmittedWajib && currentJadwal && (
                      <div className="status-badge" style={{ 
                        padding: '8px 14px', 
                        background: isLate ? '#fef2f2' : '#f8fafc',
                        color: isLate ? '#ef4444' : '#64748b',
                        border: `1px solid ${isLate ? '#fecaca' : '#e2e8f0'}`,
                      }}>
                        <Clock size={14} />
                        Batas: {new Date(currentJadwal.batas_tanggal).toLocaleDateString('id-ID')} {isLate && '(Terlambat)'}
                      </div>
                    )}
                    <button 
                      className="action-btn primary" 
                      onClick={() => { setJawabanForm({}); setIsSubmitWajibModalOpen(true); }}
                      disabled={hasSubmittedWajib}
                    >
                      <Plus size={18} />
                      {hasSubmittedWajib ? 'Sudah Dilaporkan' : 'Isi Laporan'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loadingWajib ? <p>Memuat riwayat...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {myLaporanWajibList.filter(l => l.kategori_bulan === selectedKategoriBulan).map(laporan => (
                  <div key={laporan.id} className="laporan-item-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', padding: '14px', borderRadius: '16px' }}>
                          <FileText size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>{laporan.kategori_bulan}</div> 
                          <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px', fontWeight: 500 }}>Dikirim: {laporan.bulan_tahun}</div>
                        </div>
                        {laporan.status_waktu && (
                          <span className="status-badge" style={{ 
                            marginLeft: '12px', 
                            background: laporan.status_waktu === 'Tepat Waktu' ? '#ecfdf5' : '#fef2f2',
                            color: laporan.status_waktu === 'Tepat Waktu' ? '#10b981' : '#ef4444',
                            border: `1px solid ${laporan.status_waktu === 'Tepat Waktu' ? '#a7f3d0' : '#fecaca'}`,
                          }}>
                            {laporan.status_waktu === 'Tepat Waktu' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {laporan.status_waktu}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="status-badge" style={{ color: '#10b981', background: '#ecfdf5', padding: '10px 16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                          <CheckCircle size={18} /> Terkirim
                        </span>
                        <button 
                          className="action-btn outline" 
                          onClick={() => setPrintLaporan(laporan)}
                        >
                          <Printer size={18} /> Cetak
                        </button>
                      </div>
                    </div>
                    {currentUser?.level !== 'pjutd' && (
                      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {laporan.jawabans.map((j: any) => (
                          <div key={j.id} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>{j.soal_laporan?.pertanyaan}</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4' }}>{j.jawaban || '-'}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
        <div className="laporan-card-header laporan-mendesak-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                <AlertCircle size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Laporan Mendesak</h2>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>Laporan khusus untuk kejadian luar biasa / insidental</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>T.A:</span>
                <select 
                  className="styled-input" 
                  value={selectedTahunAjaran} 
                  onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                  style={{ minWidth: '160px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                >
                  {tahunAjaranList.map(ta => (
                    <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                  ))}
                </select>
              </div>
              
              {isSender && selectedTahunAjaran === activeTahunAjaran?.id && (
                <>
                  <div style={{ width: '1px', height: '32px', background: '#e2e8f0', margin: '0 4px' }}></div>
                  <button 
                    className="action-btn danger" 
                    onClick={() => setIsMendesakModalOpen(true)}
                  >
                    <AlertCircle size={18} /> Buat Laporan Mendesak
                  </button>
                </>
              )}
            </div>
          </div>

          {loadingMendesak ? <p>Memuat laporan...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myLaporanMendesakList.map(laporan => (
                <div key={laporan.id} className="laporan-item-card" style={{ 
                  background: laporan.status_penyelesaian === 'Selesai' ? '#f8fafc' : 'white',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{laporan.judul}</h4>
                      <div style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {new Date(laporan.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="status-badge" style={{ 
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
                      <button 
                        className="action-btn outline" 
                        onClick={() => setPrintLaporan(laporan)}
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <Printer size={14} /> Cetak
                      </button>
                    </div>
                  </div>
                  {/* Isi laporan disembunyikan sesuai permintaan */}
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
          {loadingMySoal ? <p>Memuat pertanyaan...</p> : myKategoriSoal.length === 0 ? <p>Belum ada soal aktif untuk level Anda.</p> : (
            myKategoriSoal.map((kategori) => (
              <div key={kategori.id} style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                  {kategori.nama_kategori}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {kategori.soal_laporan?.map((soal, index) => (
                    <div key={soal.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem' }}>
                        {index + 1}. {soal.pertanyaan}
                      </label>
                      {soal.tipe_soal === 'pilihan_ganda_multi' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {soal.opsi_jawaban?.map((group: any, idx) => (
                            <div key={idx}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>{group.label}</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {group.options.map((opt: string, optIdx: number) => (
                                  <label key={optIdx} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                                    background: 'white', cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                  }}>
                                    <input 
                                      type="radio" 
                                      name={`soal_${soal.id}_group_${idx}`} 
                                      value={opt} 
                                      required 
                                      onChange={e => setJawabanForm({
                                        ...jawabanForm, 
                                        [soal.id]: { ...((jawabanForm as any)[soal.id] || {}), [group.label]: e.target.value }
                                      })}
                                      style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : soal.tipe_soal === 'uraian' ? (
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
                  ))}
                  {(!kategori.soal_laporan || kategori.soal_laporan.length === 0) && (
                    <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>Belum ada soal di kategori ini.</p>
                  )}
                </div>
              </div>
            ))
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsSubmitWajibModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={myKategoriSoal.length === 0 || submitWajibMutation.isPending} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
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
          {printLaporan && 'kategori_bulan' in printLaporan && currentUser?.level === 'utd' && (
            <CetakLaporanWajibUtd laporan={printLaporan} kopSuratUrl={getKopUrl('utd')} />
          )}
          {printLaporan && 'kategori_bulan' in printLaporan && currentUser?.level === 'pjutd' && (
            <CetakLaporanWajibPjutd laporan={printLaporan} kopSuratUrl={getKopUrl('pjutd')} />
          )}
          
          {printLaporan && 'judul' in printLaporan && (
            <CetakLaporanMendesak laporan={printLaporan} kopSuratUrl={getKopUrl(currentUser?.level === 'utd' ? 'utd' : 'pjutd')} />
          )}
          
          {printBlankoType === 'utd' && !printLaporan && (
            <CetakLaporanWajibUtd 
              laporan={{
                user: { fullname: currentUser?.fullname, santri: currentUser?.santri },
                jawabans: [],
                kategori_bulan: selectedKategoriBulan
              }} 
              kopSuratUrl={getKopUrl('utd')} 
              blankoKategoriList={myKategoriSoal}
            />
          )}
          {printBlankoType === 'pjutd' && !printLaporan && (
            <CetakLaporanWajibPjutd 
              laporan={{
                user: { fullname: currentUser?.fullname, pjutd: currentUser?.pjutd },
                jawabans: [],
                kategori_bulan: selectedKategoriBulan
              }} 
              kopSuratUrl={getKopUrl('pjutd')} 
              blankoKategoriList={myKategoriSoal}
            />
          )}
        </div>
      )}
    </>
  );
};

export default LaporanSayaPage;
