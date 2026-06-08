import React from 'react';

interface LatestLaporanListProps {
  latestLaporan: any[];
}

const LatestLaporanList: React.FC<LatestLaporanListProps> = ({ latestLaporan }) => {
  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>Laporan Terbaru</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {latestLaporan?.length > 0 ? (
          latestLaporan.map((laporan: any, idx: number) => (
            <div 
              key={idx} 
              style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{laporan.topik_laporan}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span>Oleh: {laporan.user?.fullname || 'Sistem'}</span>
                </div>
              </div>
              <span style={{ 
                padding: '6px 12px', 
                borderRadius: '20px', 
                background: laporan.status === 'selesai' ? '#f0fdf4' : (laporan.status === 'diproses' ? '#fefce8' : '#fef2f2'), 
                color: laporan.status === 'selesai' ? '#166534' : (laporan.status === 'diproses' ? '#854d0e' : '#991b1b'), 
                fontSize: '0.75rem', 
                fontWeight: 600,
                textTransform: 'capitalize',
                border: `1px solid ${laporan.status === 'selesai' ? '#bbf7d0' : (laporan.status === 'diproses' ? '#fef08a' : '#fecaca')}`
              }}>
                {laporan.status}
              </span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
            Belum ada laporan terbaru.
          </p>
        )}
      </div>
    </div>
  );
};

export default LatestLaporanList;
