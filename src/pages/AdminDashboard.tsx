import React from 'react';
import { Users, Building2, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Santri', value: '1,234', icon: Users, color: '#00B0FB' },
    { label: 'Badkom Wilayah', value: '12', icon: Building2, color: '#FCD526' },
    { label: 'Laporan Masuk', value: '45', icon: FileText, color: '#22c55e' },
    { label: 'Surat Terkirim', value: '89', icon: Mail, color: '#ef4444' },
  ];

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
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>Laporan Kegiatan UTD {i}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>2 jam yang lalu • Oleh: UTD Panyeppen</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#f0fdf4', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>Selesai</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Aktivitas Terakhir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)', marginTop: '6px' }}></div>
                <div>
                  <p style={{ fontSize: '0.875rem' }}>Admin menambahkan data santri baru</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>10:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
