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
            <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{laporan.topik_laporan}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • Oleh: {laporan.user?.fullname || 'Sistem'}
                </p>
              </div>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                background: laporan.status === 'selesai' ? '#f0fdf4' : (laporan.status === 'diproses' ? '#fefce8' : '#fef2f2'), 
                color: laporan.status === 'selesai' ? '#166534' : (laporan.status === 'diproses' ? '#854d0e' : '#991b1b'), 
                fontSize: '0.75rem', 
                fontWeight: 600,
                textTransform: 'capitalize'
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
