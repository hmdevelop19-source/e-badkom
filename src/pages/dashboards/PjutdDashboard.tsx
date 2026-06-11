import React from 'react';
import { Users, FileText, Mail, MapPin, School, Phone } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import LatestLaporanList from '../../components/dashboard/LatestLaporanList';
import LatestActivityList from '../../components/dashboard/LatestActivityList';

interface PjutdDashboardProps {
  data: any;
}

const PjutdDashboard: React.FC<PjutdDashboardProps> = ({ data }) => {
  const profile = data?.profile;
  const tahunAjaran = data?.tahun_ajaran?.nama || 'Tahun Ajaran Aktif';

  const stats = [
    { label: `UT-D Binaan (${tahunAjaran})`, value: data?.stats?.total_utd || 0, icon: Users, color: '#00B0FB' },
    { label: `Laporan Masuk (${tahunAjaran})`, value: data?.stats?.total_laporan || 0, icon: FileText, color: '#22c55e' },
    { label: 'Surat Keputusan', value: data?.stats?.total_surat || 0, icon: Mail, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Profil Lembaga Section */}
      {profile && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-80px', right: '10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <School size={28} />
              {profile.nama_madrasah || profile.yayasan || 'Profil Lembaga'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '24px' }}>
              Penanggung Jawab: <strong style={{ color: 'white' }}>{profile.nama_pjutd}</strong>
            </p>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.875rem' }}>
                <MapPin size={16} />
                <span>{[profile.desa, profile.kecamatan].filter(Boolean).join(', ') || 'Alamat belum diatur'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.875rem' }}>
                <Phone size={16} />
                <span>{profile.no_hp || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* Profil UTD Aktif Section */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--primary)" />
          Profil UT-D Bertugas ({tahunAjaran})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {data?.utds_aktif?.length > 0 ? (
            data.utds_aktif.map((utd: any) => (
              <div key={utd.id} style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: '#f8fafc'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.25rem'
                }}>
                  {utd.nama ? utd.nama.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{utd.nama}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {utd.desa ? `${utd.desa}, ${utd.kecamatan}` : 'Alamat belum diatur'}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: utd.status?.toLowerCase() === 'aktif' ? '#f0fdf4' : (utd.status?.toLowerCase() === 'dimutasi' ? '#fefce8' : '#fef2f2'),
                  color: utd.status?.toLowerCase() === 'aktif' ? '#166534' : (utd.status?.toLowerCase() === 'dimutasi' ? '#854d0e' : '#991b1b'),
                  border: `1px solid ${utd.status?.toLowerCase() === 'aktif' ? '#bbf7d0' : (utd.status?.toLowerCase() === 'dimutasi' ? '#fef08a' : '#fecaca')}`,
                  whiteSpace: 'nowrap'
                }}>
                  {utd.status || 'Aktif'}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tidak ada UT-D yang sedang bertugas pada tahun ajaran ini.</p>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <LatestLaporanList latestLaporan={data?.latest_laporan || []} />
        <LatestActivityList latestLaporan={data?.latest_laporan || []} />
      </div>
    </div>
  );
};

export default PjutdDashboard;
