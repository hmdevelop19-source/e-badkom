import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, ChevronDown, ChevronRight, 
  Settings, Database, ClipboardCheck, Archive, Briefcase, Award, Bell
} from 'lucide-react';
import logoBadkom from '../assets/LOGOBADKOM.png';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserStr) {
      navigate('/login');
    }
  }, [navigate, currentUserStr]);

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
      ]
    },
    {
      label: 'Evaluasi',
      icon: Award,
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'],
      subItems: [
        { label: 'Penilaian Santri (UTD)', path: '/admin/penilaian', roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'] },
        { label: 'Penilaian PJ UTD', path: '/admin/penilaian-pjutd', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    { 
      label: 'Validasi & Kelulusan', 
      icon: ClipboardCheck, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd'],
      subItems: [
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
          <img src={logoBadkom} alt="Logo E-Badkom" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
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
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="top-header" style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(12px)', 
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky', 
          top: 0, 
          padding: '12px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '2px', fontWeight: 500 }}>
              Selamat datang kembali,
            </p>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              {location.pathname === '/admin' ? 'Dashboard Overview' : 
               allNavItems.flatMap(i => [i, ...(i.subItems || [])]).find(i => i.path === location.pathname)?.label || 'E-Badkom'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              style={{ background: '#F8FAFC', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', transition: 'all 0.2s', position: 'relative' }} 
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = 'var(--primary)'; }} 
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '6px', right: '8px', width: '6px', height: '6px', background: 'var(--error)', borderRadius: '50%', border: '2px solid #fff' }}></span>
            </button>
            
            <div style={{ width: '1px', height: '28px', background: 'var(--border)' }}></div>

            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '30px', transition: 'all 0.2s', border: '1px solid transparent' }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, margin: 0, lineHeight: 1.2, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{currentUser?.fullname || 'Administrator'}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', margin: 0, marginTop: '2px', fontWeight: 600 }}>{level.toUpperCase()}</p>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 12px rgba(66, 47, 111, 0.2)' }}>
                  {currentUser?.fullname?.charAt(0).toUpperCase() || 'A'}
                </div>
                <ChevronDown size={14} color="var(--text-secondary)" style={{ marginLeft: '-4px', transition: 'transform 0.2s', transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </div>
            
            {isProfileOpen && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                  onClick={() => setIsProfileOpen(false)}
                />
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '8px', 
                  background: 'var(--surface)', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                  border: '1px solid var(--border)',
                  zIndex: 100,
                  minWidth: '200px',
                  overflow: 'hidden'
                }}>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: 'var(--error)',
                      fontWeight: 500,
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
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
