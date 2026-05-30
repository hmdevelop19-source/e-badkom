import React from 'react';
import { Users, Building2, FileText, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    }
  });

  const stats = [
    { label: 'Calon UT-D & UT-D', value: dashboardData?.stats?.total_santri || 0, icon: Users, color: '#00B0FB' },
    { label: 'Badkom Wilayah', value: dashboardData?.stats?.total_badkom || 0, icon: Building2, color: '#FCD526' },
    { label: 'Laporan Masuk', value: dashboardData?.stats?.total_laporan || 0, icon: FileText, color: '#22c55e' },
    { label: 'Surat Terkirim', value: dashboardData?.stats?.total_surat || 0, icon: Mail, color: '#ef4444' },
  ];

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card stat-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Laporan Terbaru</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboardData?.latest_laporan?.length > 0 ? (
              dashboardData.latest_laporan.map((laporan: any, idx: number) => (
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

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Aktivitas Terakhir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {dashboardData?.latest_laporan?.length > 0 ? (
              dashboardData.latest_laporan.slice(0, 3).map((laporan: any, idx: number) => (
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
      </div>
    </div>
  );
};

export default AdminDashboard;
