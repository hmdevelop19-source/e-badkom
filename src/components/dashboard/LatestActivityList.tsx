import React from 'react';

interface LatestActivityListProps {
  latestLaporan: any[];
}

const LatestActivityList: React.FC<LatestActivityListProps> = ({ latestLaporan }) => {
  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>Aktivitas Terakhir</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {latestLaporan?.length > 0 ? (
          latestLaporan.slice(0, 3).map((laporan: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)', marginTop: '6px' }}></div>
              <div>
                <p style={{ fontSize: '0.875rem' }}>{laporan.user?.fullname || 'Pengguna'} mengirim laporan baru</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(laporan.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tidak ada aktivitas terbaru.</p>
        )}
      </div>
    </div>
  );
};

export default LatestActivityList;
