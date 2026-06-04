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

  // Filter only subordinates' reports (not own reports) AND filter by selectedTahunAjaran & selectedKategoriBulan
  const incomingReports = laporanWajibList.filter(l => 
    l.user?.id !== currentUser?.id && 
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

        {isLoading ? <p>Memuat laporan masuk...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {incomingReports.map(laporan => (
              <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div>
                    <strong>Pengirim: </strong> {laporan.user?.fullname} 
                    <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', marginLeft: '8px' }}>
                      {laporan.user?.level.toUpperCase()}
                    </span>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Kategori: {laporan.kategori_bulan} | Dikirim pada: {new Date(laporan.created_at).toLocaleDateString('id-ID')} | T.A: {laporan.tahunAjaran?.nama_tahun_ajaran}</span>
                      {laporan.status_waktu && (
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.7rem', 
                          fontWeight: 600,
                          background: laporan.status_waktu === 'Tepat Waktu' ? '#ecfdf5' : '#fef2f2',
                          color: laporan.status_waktu === 'Tepat Waktu' ? '#10b981' : '#ef4444'
                        }}>
                          {laporan.status_waktu}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                      <CheckCircle size={14} /> Terkirim
                    </span>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setPrintLaporan(laporan)}
                      style={{ padding: '6px 12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Printer size={16} /> Cetak
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {laporan.jawabans.map((j: any) => (
                    <div key={j.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '4px' }}>P: {j.soal_laporan?.pertanyaan}</div>
                      <div style={{ fontWeight: 500 }}>J: {j.jawaban}</div>
                    </div>
                  ))}
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
                user: { fullname: '.........................', santri: { desa: '................', kecamatan: '................' } },
                jawabans: []
              }} 
              kopSuratUrl={getKopUrl('utd')} 
            />
          )}
          {printBlankoType === 'pjutd' && !printLaporan && (
            <CetakLaporanWajibPjutd 
              laporan={{
                user: { fullname: '.........................', pjutd: { nama_pjutd: '.........................', desa: '................', kecamatan: '................', nama_madrasah: '.........................' } },
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

export default LaporanMasukWajibPage;
