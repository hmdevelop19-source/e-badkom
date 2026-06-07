import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';

const RiwayatTempatTugasPage: React.FC = () => {
  const { data: riwayat = [], isLoading } = useQuery({
    queryKey: ['riwayat-tempat-tugas'],
    queryFn: async () => {
      const response = await api.get('/utd?all_history=true');
      return response.data;
    }
  });

  return (
    <>
      <style>{`
        .history-card {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .history-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 16px;
        }
        .history-details-row {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .history-card {
            flex-direction: column;
            gap: 16px;
          }
          .history-icon {
            width: 48px !important;
            height: 48px !important;
            border-radius: 12px !important;
          }
          .history-icon svg {
            width: 24px;
            height: 24px;
          }
          .history-details-row {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
      <div className="fade-in">
      <div className="header-actions" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Riwayat Tempat Tugas</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Daftar riwayat lembaga penugasan Anda dari waktu ke waktu.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Memuat data riwayat...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {riwayat.length > 0 ? (
            riwayat.map((tugas: any) => (
              <div key={tugas.id} className="card history-card" style={{ padding: '24px' }}>
                <div className="history-icon" style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '16px', 
                  background: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <MapPin size={28} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="history-title-row">
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', lineHeight: '1.3' }}>
                      {tugas.pjutd?.nama_madrasah || tugas.pjutd?.yayasan || 'Nama Lembaga Tidak Tersedia'}
                    </h3>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      background: tugas.status === 'Aktif' ? '#dcfce7' : '#f1f5f9',
                      color: tugas.status === 'Aktif' ? '#166534' : '#475569',
                      whiteSpace: 'nowrap'
                    }}>
                      {tugas.status}
                    </span>
                  </div>
                  
                  <div className="history-details-row">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Calendar size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Tahun Ajaran</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{tugas.tahun_ajaran?.nama_tahun_ajaran}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Penanggung Jawab</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{tugas.pjutd?.nama_pjutd}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Alamat Lembaga</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                      {tugas.pjutd?.alamat || 'Alamat tidak tersedia'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <MapPin size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
              <h3>Belum Ada Riwayat Penugasan</h3>
              <p>Anda belum memiliki riwayat tempat tugas yang terdata di sistem.</p>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default RiwayatTempatTugasPage;
