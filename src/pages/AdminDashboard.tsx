import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

import SuperadminDashboard from './dashboards/SuperadminDashboard';
import BadkomWilayahDashboard from './dashboards/BadkomWilayahDashboard';
import PjutdDashboard from './dashboards/PjutdDashboard';
import UtdDashboard from './dashboards/UtdDashboard';

const AdminDashboard: React.FC = () => {
  const currentUserStr = localStorage.getItem('user');
  const user = currentUserStr ? JSON.parse(currentUserStr) : null;
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    }
  });

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat dashboard...</div>;
  }

  const renderDashboard = () => {
    switch (dashboardData?.role || user?.level) {
      case 'admin':
      case 'badkom_pusat':
        return <SuperadminDashboard data={dashboardData} />;
      case 'badkom_wilayah':
        return <BadkomWilayahDashboard data={dashboardData} />;
      case 'pjutd':
        return <PjutdDashboard data={dashboardData} />;
      case 'utd':
        return <UtdDashboard data={dashboardData} />;
      default:
        return <div>Dashboard tidak tersedia untuk role ini.</div>;
    }
  };

  return (
    <>
      {renderDashboard()}
    </>
  );
};

export default AdminDashboard;
