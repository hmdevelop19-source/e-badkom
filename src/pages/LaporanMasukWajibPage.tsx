import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { FileText, CheckCircle } from 'lucide-react';

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
  user: any;
  jawabans: any[];
  tahunAjaran?: TahunAjaran;
}

const KATEGORI_BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => `Bulan Ke-${i + 1}`);

const LaporanMasukWajibPage: React.FC = () => {
  const [selectedKategoriBulan, setSelectedKategoriBulan] = useState('Bulan Ke-1');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | ''>('');

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

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  // Filter only subordinates' reports (not own reports) AND filter by selectedTahunAjaran & selectedKategoriBulan
  const incomingReports = laporanWajibList.filter(l => 
    l.user?.id !== currentUser?.id && 
    l.kategori_bulan === selectedKategoriBulan &&
    l.tahun_ajaran_id === selectedTahunAjaran
  );

  return (
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
                    <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                      Kategori: {laporan.kategori_bulan} | Dikirim pada: {laporan.bulan_tahun} | T.A: {laporan.tahunAjaran?.nama_tahun_ajaran}
                    </div>
                  </div>
                  <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                    <CheckCircle size={14} /> Terkirim
                  </span>
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
  );
};

export default LaporanMasukWajibPage;
