import React from 'react';
import { Users, Building, FileText, Mail } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import LatestLaporanList from '../../components/dashboard/LatestLaporanList';
import LatestActivityList from '../../components/dashboard/LatestActivityList';

interface BadkomWilayahDashboardProps {
  data: any;
}

const BadkomWilayahDashboard: React.FC<BadkomWilayahDashboardProps> = ({ data }) => {
  const stats = [
    { label: 'PJU-TD', value: data?.stats?.total_pjutd || 0, icon: Building, color: '#00B0FB' },
    { label: 'UT-D', value: data?.stats?.total_utd || 0, icon: Users, color: '#FCD526' },
    { label: 'Total Laporan', value: data?.stats?.total_laporan || 0, icon: FileText, color: '#22c55e' },
    { label: 'Surat Permohonan', value: data?.stats?.total_surat || 0, icon: Mail, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="dashboard-grid">
        <LatestLaporanList latestLaporan={data?.latest_laporan || []} />
        <LatestActivityList latestLaporan={data?.latest_laporan || []} />
      </div>
    </div>
  );
};

export default BadkomWilayahDashboard;
