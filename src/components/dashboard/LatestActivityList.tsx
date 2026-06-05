import React from 'react';

interface LatestActivityListProps {
  latestLaporan: any[];
}

const LatestActivityList: React.FC<LatestActivityListProps> = ({ latestLaporan }) => {
  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>Aktivitas Terakhir</h3>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '8px' }}>
        {/* Continuous timeline line */}
        <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
        
        {latestLaporan?.length > 0 ? (
          latestLaporan.slice(0, 3).map((laporan: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1, paddingBottom: idx === 2 ? 0 : '24px' }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: 'var(--secondary)', 
                marginTop: '6px',
                border: '2px solid white',
                boxShadow: '0 0 0 2px var(--secondary)'
              }}></div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', flex: 1, border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{laporan.user?.fullname || 'Pengguna'} <span style={{fontWeight: 'normal', color: 'var(--text-secondary)'}}>mengirim laporan baru</span></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {new Date(laporan.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', zIndex: 1 }}>Tidak ada aktivitas terbaru.</p>
        )}
      </div>
    </div>
  );
};

export default LatestActivityList;
