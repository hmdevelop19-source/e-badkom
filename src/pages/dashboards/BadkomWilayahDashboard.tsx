import React from 'react';
import { Users, Building, FileText, Mail } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import LatestLaporanList from '../../components/dashboard/LatestLaporanList';
import LatestActivityList from '../../components/dashboard/LatestActivityList';
import PenugasanChart from '../../components/dashboard/PenugasanChart';

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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PenugasanChart data={data?.penugasan_per_tahun || []} />
        </div>
        <div className="lg:col-span-1">
          <LatestActivityList latestLaporan={data?.latest_laporan || []} />
        </div>
      </div>

      <div className="w-full">
        <LatestLaporanList latestLaporan={data?.latest_laporan || []} />
      </div>
    </div>
  );
};

export default BadkomWilayahDashboard;
