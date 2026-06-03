import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <LatestLaporanList latestLaporan={data?.latest_laporan || []} />
        <LatestActivityList latestLaporan={data?.latest_laporan || []} />
      </div>
    </div>
  );
};

export default UtdDashboard;
