import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Mail, LogOut, Building2, Network, MapPin, Calendar, Award, Shield } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';

  const allNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd', 'utd'] },
    { label: 'Manajemen Akun', path: '/admin/users', icon: Shield, roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
    { label: 'Santri', path: '/admin/santri', icon: Users, roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
    { label: 'Badkom', path: '/admin/badkom', icon: Building2, roles: ['admin', 'badkom_pusat'] },
    { label: 'PJ UTD', path: '/admin/pjutd', icon: Network, roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
    { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', icon: Calendar, roles: ['admin', 'badkom_pusat'] },
    { label: 'Penugasan', path: '/admin/penugasan', icon: MapPin, roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
    { label: 'Penilaian', path: '/admin/penilaian', icon: Award, roles: ['admin', 'badkom_pusat', 'pjutd'] },
    { label: 'Laporan', path: '/admin/laporan', icon: FileText, roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd', 'utd'] },
    { label: 'Surat', path: '/admin/surat', icon: Mail, roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(level));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div style={{ padding: '0 16px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>E-Badkom</h2>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <button 
          className="nav-link" 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600 }}>Administrator</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>admin@ebadkom.com</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
              A
            </div>
          </div>
        </header>
        
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
