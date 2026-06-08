import React from 'react';
import { Users, Building2, FileText, Mail } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import LatestLaporanList from '../../components/dashboard/LatestLaporanList';
import LatestActivityList from '../../components/dashboard/LatestActivityList';

interface SuperadminDashboardProps {
  data: any;
}

const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({ data }) => {
  const stats = [
    { label: 'Calon UT-D & UT-D', value: data?.stats?.total_santri || 0, icon: Users, color: '#00B0FB' },
    { label: 'Badkom Wilayah', value: data?.stats?.total_badkom || 0, icon: Building2, color: '#FCD526' },
    { label: 'Total Laporan', value: data?.stats?.total_laporan || 0, icon: FileText, color: '#22c55e' },
    { label: 'Surat Terkirim', value: data?.stats?.total_surat || 0, icon: Mail, color: '#ef4444' },
  ];

  return (
    <>
      <style>{`
        .dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .superadmin-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .superadmin-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="dashboard-grid">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        <div className="superadmin-main-grid">
          <LatestLaporanList latestLaporan={data?.latest_laporan || []} />
          <LatestActivityList latestLaporan={data?.latest_laporan || []} />
        </div>
      </div>
    </>
  );
};

export default SuperadminDashboard;
