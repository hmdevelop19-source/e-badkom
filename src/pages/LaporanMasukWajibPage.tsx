import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { FileText, CheckCircle, Printer, FilePlus } from 'lucide-react';
import { CetakLaporanWajibUtd } from '../components/CetakLaporanWajibUtd';
import { CetakLaporanWajibPjutd } from '../components/CetakLaporanWajibPjutd';

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
  created_at: string;
  user: any;
  jawabans: any[];
  tahunAjaran?: TahunAjaran;
}



const LaporanMasukWajibPage: React.FC = () => {
  const [selectedKategoriBulan, setSelectedKategoriBulan] = useState('Bulan Ke-1');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | ''>('');
  const [activeRoleTab, setActiveRoleTab] = useState<'utd' | 'pjutd'>('utd');
  const [printLaporan, setPrintLaporan] = useState<LaporanWajib | null>(null);
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

  const { data: laporanWajibList = [], isLoading } = useQuery<LaporanWajib[]>({
    queryKey: ['laporan_wajib'],
    queryFn: async () => {
      const res = await api.get('/laporan-wajib');
      return res.data;
    }
  });

  const { data: blankoKategoriUtd = [] } = useQuery({
    queryKey: ['kategori_soal', 'utd'],
    queryFn: async () => {
      const res = await api.get(`/kategori-soal?target_level=utd`);
      return res.data;
    }
  });

  const { data: blankoKategoriPjutd = [] } = useQuery({
    queryKey: ['kategori_soal', 'pjutd'],
    queryFn: async () => {
      const res = await api.get(`/kategori-soal?target_level=pjutd`);
      return res.data;
    }
  });

  useEffect(() => {
    if (printLaporan || printBlankoType) {
      setTimeout(() => {
        window.print();
        // Option to reset state after printing could go here, but usually users close the print dialog.
        // We'll reset it when the window gains focus just in case, or provide a close button.
      }, 500);
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

  // Filter only subordinates' reports (not own reports) AND filter by selectedTahunAjaran & selectedKategoriBulan & activeRoleTab
  const incomingReports = laporanWajibList.filter(l => 
    l.user?.id !== currentUser?.id && 
    l.user?.level === activeRoleTab &&
    l.kategori_bulan === selectedKategoriBulan &&
    l.tahun_ajaran_id === selectedTahunAjaran
  );

  const getKopUrl = (type: 'utd' | 'pjutd') => {
    const key = type === 'utd' ? 'kop_laporan_utd' : 'kop_laporan_pjutd';
    const path = settings.find((s: any) => s.key === key)?.value;
    if (path) return import.meta.env.VITE_API_URL.replace('/api', '') + '/' + path;
    return undefined;
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Daftar Laporan Wajib Bawahan</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>T.A:</span>
              <select 
                className="form-control" 
                value={selectedTahunAjaran} 
                onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                style={{ padding: '6px 12px' }}
              >
                {tahunAjaranList.map(ta => (
                  <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Kategori:</span>
              <select 
                className="form-control" 
                value={selectedKategoriBulan} 
                onChange={e => setSelectedKategoriBulan(e.target.value)}
                style={{ padding: '6px 12px' }}
              >
                {KATEGORI_BULAN_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-outline" 
              onClick={() => setPrintBlankoType('utd')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem' }}
            >
              <FilePlus size={16} /> Blanko UT-D
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => setPrintBlankoType('pjutd')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem' }}
            >
              <FilePlus size={16} /> Blanko PJUT-D
            </button>
          </div>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', paddingBottom: '8px' }}>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              borderBottom: activeRoleTab === 'utd' ? '2px solid var(--primary-color)' : '2px solid transparent',
              padding: '8px 16px',
              fontWeight: activeRoleTab === 'utd' ? 600 : 400,
              color: activeRoleTab === 'utd' ? 'var(--primary-color)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveRoleTab('utd')}
          >
            Laporan UT-D
          </button>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              borderBottom: activeRoleTab === 'pjutd' ? '2px solid var(--primary-color)' : '2px solid transparent',
              padding: '8px 16px',
              fontWeight: activeRoleTab === 'pjutd' ? 600 : 400,
              color: activeRoleTab === 'pjutd' ? 'var(--primary-color)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveRoleTab('pjutd')}
          >
            Laporan PJUT-D
          </button>
        </div>

        {isLoading ? <p>Memuat laporan masuk...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {incomingReports.map(laporan => (
              <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>Pengirim: </strong> <span style={{ fontSize: '1.1rem' }}>{laporan.user?.fullname}</span> 
                    <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', marginLeft: '8px' }}>
                      {laporan.user?.level.toUpperCase()}
                    </span>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Kategori: {laporan.kategori_bulan} | Dikirim pada: {new Date(laporan.created_at).toLocaleDateString('id-ID')} | T.A: {laporan.tahunAjaran?.nama_tahun_ajaran}</span>
                      {laporan.status_waktu && (
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          background: laporan.status_waktu === 'Tepat Waktu' ? '#ecfdf5' : '#fef2f2',
                          color: laporan.status_waktu === 'Tepat Waktu' ? '#10b981' : '#ef4444'
                        }}>
                          {laporan.status_waktu}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                      <CheckCircle size={16} /> Terkirim
                    </span>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setPrintLaporan(laporan)}
                      style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', background: '#3b0764' }}
                    >
                      <Printer size={16} /> Cetak
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {incomingReports.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
                <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p>Belum ada laporan wajib dari bawahan untuk {selectedKategoriBulan} pada Tahun Ajaran yang dipilih.</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      
      {/* Print Areas */}
      {(printLaporan || printBlankoType) && (
        <div className="print-area">
          {printLaporan && printLaporan.user?.level === 'utd' && (
            <CetakLaporanWajibUtd laporan={printLaporan} kopSuratUrl={getKopUrl('utd')} />
          )}
          {printLaporan && printLaporan.user?.level === 'pjutd' && (
            <CetakLaporanWajibPjutd laporan={printLaporan} kopSuratUrl={getKopUrl('pjutd')} />
          )}
          
          {printBlankoType === 'utd' && !printLaporan && (
            <CetakLaporanWajibUtd 
              laporan={{
                user: { fullname: '...................................', santri: { desa: '................', kecamatan: '................' } },
                jawabans: [],
                kategori_bulan: selectedKategoriBulan
              }} 
              kopSuratUrl={getKopUrl('utd')} 
              blankoKategoriList={blankoKategoriUtd}
            />
          )}
          {printBlankoType === 'pjutd' && !printLaporan && (
            <CetakLaporanWajibPjutd 
              laporan={{
                user: { fullname: '...................................', pjutd: { nama_pjutd: '...................................', desa: '................', kecamatan: '................', nama_madrasah: '...................................' } },
                jawabans: [],
                kategori_bulan: selectedKategoriBulan
              }} 
              kopSuratUrl={getKopUrl('pjutd')} 
              blankoKategoriList={blankoKategoriPjutd}
            />
          )}
        </div>
      )}
    </>
  );
};

export default LaporanMasukWajibPage;
