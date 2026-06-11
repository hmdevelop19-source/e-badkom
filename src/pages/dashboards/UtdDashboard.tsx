import React from 'react';
import { FileText, CheckCircle, User, MapPin } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import LatestLaporanList from '../../components/dashboard/LatestLaporanList';
import LatestActivityList from '../../components/dashboard/LatestActivityList';

interface UtdDashboardProps {
  data: any;
}

const UtdDashboard: React.FC<UtdDashboardProps> = ({ data }) => {
  const stats = [
    { label: 'Total Laporan Saya', value: data?.stats?.total_laporan || 0, icon: FileText, color: '#00B0FB' },
    { label: 'Laporan Selesai', value: data?.stats?.laporan_selesai || 0, icon: CheckCircle, color: '#22c55e' },
  ];

  return (
    <>
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .utd-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .utd-main-grid {
            grid-template-columns: 1fr;
          }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div className="dashboard-grid">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {data?.profile?.foto_profil ? (
              <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${data.profile.foto_profil}`} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #4c1d95 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.5rem', fontWeight: 600 }}>
                {data?.profile?.fullname?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>{data?.profile?.fullname || 'Ustadz Tugas'}</h3>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>NIS: <span style={{ color: 'var(--primary)' }}>{data?.profile?.santri?.nis || '-'}</span></p>
              
              <div style={{ marginTop: '16px', maxWidth: '280px' }}>
                {(() => {
                  const target = data?.stats?.target_tugas_wajib || 3;
                  const validLulus = data?.stats?.valid_lulus_count || 0;
                  const progress = Math.min((validLulus / target) * 100, 100);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ color: validLulus >= target ? '#15803d' : '#64748b' }}>
                          {validLulus} / {target} Lulus
                        </span>
                        <span style={{ color: validLulus >= target ? '#15803d' : '#ca8a04' }}>
                          {validLulus >= target ? 'Selesai' : 'Belum Selesai'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${progress}%`, 
                          height: '100%', 
                          background: validLulus >= target ? '#22c55e' : '#0ea5e9', 
                          borderRadius: '4px', 
                          transition: 'width 0.5s ease-in-out' 
                        }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tempat Bertugas Saat Ini</h4>
            {data?.penugasan_aktif ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', marginBottom: '8px' }}>
                  <MapPin size={20} color="var(--primary)" />
                  {data.penugasan_aktif.pjutd?.nama_madrasah || data.penugasan_aktif.pjutd?.yayasan || '-'}
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Penanggung Jawab</span>
                    <strong style={{ color: '#475569' }}>{data.penugasan_aktif.pjutd?.nama_pjutd || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Tahun Ajaran</span>
                    <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      {data.penugasan_aktif.tahun_ajaran?.nama_tahun_ajaran || '-'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} />
                Belum ada penugasan aktif
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        <div className="utd-main-grid">
          <LatestLaporanList latestLaporan={data?.latest_laporan || []} />
          <LatestActivityList latestLaporan={data?.latest_laporan || []} />
        </div>
      </div>
    </>
  );
};

export default UtdDashboard;
