import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Shield, ChevronDown, ChevronRight, 
  Settings, Database, ClipboardCheck, Archive, Briefcase
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Data Master': location.pathname.includes('/admin/santri') || location.pathname.includes('/admin/badkom') || location.pathname.includes('/admin/pjutd') || location.pathname.includes('/admin/tahun-ajaran'),
    'Manajemen Tugas': location.pathname.includes('/admin/penugasan') || location.pathname.includes('/admin/penilaian') && !location.pathname.includes('/validasi'),
    'Validasi & Kelulusan': location.pathname.includes('/admin/validasi') || location.pathname.includes('/admin/pengajuan-boyong') || location.pathname.includes('/admin/alumni'),
    'Manajemen Laporan': location.pathname.includes('/admin/laporan'),
    'Sistem & Pengaturan': location.pathname.includes('/admin/users') || location.pathname.includes('/admin/surat') || location.pathname.includes('/admin/pengaturan'),
  });
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';

  const allNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd', 'utd'] },
    { 
      label: 'Data Master', 
      icon: Database, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', roles: ['admin', 'badkom_pusat'] },
        { label: 'Badkom', path: '/admin/badkom', roles: ['admin', 'badkom_pusat'] },
        { label: 'PJ UTD', path: '/admin/pjutd', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Santri', path: '/admin/santri', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    { 
      label: 'Manajemen Tugas', 
      icon: Briefcase, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'],
      subItems: [
        { label: 'Penugasan', path: '/admin/penugasan', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Penilaian', path: '/admin/penilaian', roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'] },
      ]
    },
    { 
      label: 'Validasi & Kelulusan', 
      icon: ClipboardCheck, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'],
      subItems: [
        { label: 'Validasi Penilaian', path: '/admin/validasi-penilaian', roles: ['admin', 'badkom_pusat'] },
        { label: 'Pengajuan Boyong', path: '/admin/pengajuan-boyong', roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'] },
        { label: 'Validasi Boyong', path: '/admin/validasi-boyong', roles: ['admin', 'badkom_pusat'] },
        { label: 'Daftar Alumni', path: '/admin/alumni', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    { 
      label: 'Manajemen Laporan', 
      icon: Archive, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd', 'utd'],
      subItems: [
        { label: 'Laporan Saya', path: '/admin/laporan', roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd', 'utd'] },
        { label: 'Laporan Wajib Masuk', path: '/admin/laporan-masuk/wajib', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Laporan Insidental Masuk', path: '/admin/laporan-masuk/insidental', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    { 
      label: 'Sistem & Pengaturan', 
      icon: Settings, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Manajemen Akun', path: '/admin/users', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Surat', path: '/admin/surat', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Pengaturan', path: '/admin/pengaturan', roles: ['admin', 'badkom_pusat'] },
      ]
    }
  ];

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div style={{ padding: '0 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)', margin: 0 }}>E-Badkom</h2>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {allNavItems.filter(item => item.roles.includes(level)).map((item) => {
            if (item.subItems) {
              const visibleSubItems = item.subItems.filter(sub => sub.roles.includes(level));
              if (visibleSubItems.length === 0) return null;
              
              const isOpen = openMenus[item.label];

              return (
                <div key={item.label}>
                  <button 
                    className="nav-link" 
                    style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={20} />
                      {item.label}
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '32px', marginTop: '4px' }}>
                      {visibleSubItems.map(subItem => (
                        <Link 
                          key={subItem.path}
                          to={subItem.path} 
                          className={`nav-link ${location.pathname === subItem.path ? 'active' : ''}`}
                          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link 
                key={item.path}
                to={item.path as string} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="top-header">
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
            {location.pathname === '/admin' ? 'Dashboard' : 
             allNavItems.flatMap(i => [i, ...(i.subItems || [])]).find(i => i.path === location.pathname)?.label || 'E-Badkom'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, margin: 0, lineHeight: 1.2 }}>{currentUser?.fullname || 'Administrator'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>{level.toUpperCase()}</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 }}>
              {currentUser?.fullname?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        
        <main className="main-content">
          <div style={{ paddingBottom: '40px' }}>
            <Outlet />
          </div>
        </main>
        
        <footer className="footer">
          &copy; {new Date().getFullYear()} E-Badkom - Sistem Informasi Manajemen Tugas & Evaluasi. Hak Cipta Dilindungi.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
