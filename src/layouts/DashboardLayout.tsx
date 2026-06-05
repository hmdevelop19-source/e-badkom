import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, ChevronDown, ChevronRight, 
  Settings, Database, ClipboardCheck, Archive, Briefcase, Award, Bell, AlertTriangle, User
} from 'lucide-react';
import logoBadkom from '../assets/LOGOBADKOM.png';
import Modal from '../components/Modal';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Data Master': location.pathname.includes('/admin/santri') || location.pathname.includes('/admin/badkom') || location.pathname.includes('/admin/pjutd') || location.pathname.includes('/admin/alumni'),
    'Manajemen Tugas': location.pathname.includes('/admin/penugasan') || location.pathname.includes('/admin/mutasi') || location.pathname.includes('/admin/penarikan') || location.pathname.includes('/admin/riwayat-utd'),
    'Evaluasi': location.pathname.includes('/admin/penilaian') && !location.pathname.includes('/validasi'),
    'Validasi Kelulusan': location.pathname.includes('/admin/validasi') || location.pathname.includes('/admin/pengajuan-boyong'),
    'Manajemen Laporan': location.pathname.includes('/admin/surat') || location.pathname.includes('/admin/laporan-masuk') || location.pathname.includes('/admin/laporan-saya'),
    'Pengaturan': location.pathname.includes('/admin/users') || location.pathname.includes('/admin/pengaturan') || location.pathname.includes('/admin/tahun-ajaran') || location.pathname === '/admin/soal-laporan' || location.pathname === '/admin/jadwal-laporan',
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-logout states
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const showLogoutWarningRef = React.useRef(false);
  const [logoutCountdown, setLogoutCountdown] = useState(60);
  const [logoutReason, setLogoutReason] = useState('');
  
  const [currentUserStr, setCurrentUserStr] = useState(localStorage.getItem('user'));
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserStr) {
      navigate('/login');
    }
  }, [navigate, currentUserStr]);

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUserStr(localStorage.getItem('user'));
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'utd'] },
    { 
      label: 'Data Master', 
      icon: Database, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Data Calon UT-D (Santri)', path: '/admin/santri', roles: ['admin', 'badkom_pusat'] },
        { label: 'Data BADKOM', path: '/admin/badkom', roles: ['admin', 'badkom_pusat'] },
        { label: 'Data PJU-TD / Lembaga', path: '/admin/pjutd', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Data Alumni', path: '/admin/alumni', roles: ['admin', 'badkom_pusat'] },
      ]
    },
    { 
      label: 'Manajemen Tugas', 
      icon: Briefcase, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Penugasan', path: '/admin/penugasan', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Mutasi', path: '/admin/mutasi', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Penarikan', path: '/admin/penarikan', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    {
      label: 'Evaluasi',
      icon: Award,
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Penilaian UT-D', path: '/admin/penilaian', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Penilaian PJU-TD', path: '/admin/penilaian-pjutd', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    { 
      label: 'Validasi Kelulusan', 
      icon: ClipboardCheck, 
      roles: ['admin', 'badkom_pusat'],
      subItems: [
        { label: 'Pengajuan Boyong', path: '/admin/pengajuan-boyong', roles: ['admin', 'badkom_pusat'] },
        { label: 'Validasi Boyong', path: '/admin/validasi-boyong', roles: ['admin', 'badkom_pusat'] },
      ]
    },
    { 
      label: 'Manajemen Laporan', 
      icon: Archive, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'utd'],
      subItems: [
        { label: 'Laporan Saya (Isi Laporan)', path: '/admin/laporan-saya', roles: ['admin', 'badkom_pusat', 'badkom_wilayah', 'utd'] },
        { label: 'Surat', path: '/admin/surat', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Laporan Wajib (Laporan Masuk)', path: '/admin/laporan-masuk/wajib', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Laporan Insidental (Laporan Masuk)', path: '/admin/laporan-masuk/insidental', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    { 
      label: 'Pengaturan', 
      icon: Settings, 
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Laporan (Pembuatan Soal)', path: '/admin/soal-laporan', roles: ['admin', 'badkom_pusat'] },
        { label: 'Jadwal Laporan Wajib', path: '/admin/jadwal-laporan', roles: ['admin', 'badkom_pusat'] },
        { label: 'Manajemen Akun', path: '/admin/users', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Pengaturan Sistem', path: '/admin/pengaturan', roles: ['admin', 'badkom_pusat'] },
        { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', roles: ['admin', 'badkom_pusat'] },
      ]
    }
  ];

  const pjutdNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['pjutd'] },
    { label: 'Profil Lembaga', path: '/admin/profil-lembaga', icon: Database, roles: ['pjutd'] },
    { label: 'Laporan', path: '/admin/laporan-saya', icon: Archive, roles: ['pjutd'] },
    { label: 'Surat', path: '/admin/surat', icon: ClipboardCheck, roles: ['pjutd'] },
    { label: 'Riwayat UT-D', path: '/admin/riwayat-utd', icon: Briefcase, roles: ['pjutd'] },
  ];

  const allNavItems = level === 'pjutd' ? pjutdNavItems : adminNavItems;

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  React.useEffect(() => {
    let idleTimeoutId: ReturnType<typeof setTimeout>;
    let countdownIntervalId: ReturnType<typeof setInterval>;

    const performAutoLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    };

    const startCountdown = (reason: string, seconds: number) => {
      setLogoutReason(reason);
      setLogoutCountdown(seconds);
      setShowLogoutWarning(true);
      showLogoutWarningRef.current = true;

      clearInterval(countdownIntervalId);
      
      let timeLeft = seconds;
      countdownIntervalId = setInterval(() => {
        timeLeft -= 1;
        setLogoutCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalId);
          performAutoLogout();
        }
      }, 1000);
    };

    const handleOffline = () => {
      startCountdown("Koneksi internet Anda terputus.", 5);
    };

    window.addEventListener('offline', handleOffline);

    const resetIdleTimer = () => {
      if (showLogoutWarningRef.current) return; // Do not reset if warning is already showing
      
      clearTimeout(idleTimeoutId);
      // Show warning after 9 minutes of inactivity
      idleTimeoutId = setTimeout(() => {
        startCountdown("Tidak ada aktivitas yang terdeteksi.", 60);
      }, 540000); 
    };

    resetIdleTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    // Only add listeners if warning is not showing, to prevent accidental resets
    // Actually, we'll keep listeners but the resetIdleTimer checks showLogoutWarning
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    return () => {
      window.removeEventListener('offline', handleOffline);
      clearTimeout(idleTimeoutId);
      clearInterval(countdownIntervalId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [navigate]);

  const handleStayLoggedIn = () => {
    setShowLogoutWarning(false);
    showLogoutWarningRef.current = false;
    // We need to trigger resetIdleTimer here so it starts the 9 min timer again.
    // Wait, the activity listeners will pick up user activity immediately, so it's fine.
  };

  return (
    <div className="layout-container">
      <style>{`
        /* Enhanced Sidebar Styles */
        .sidebar-enhanced {
          width: 280px;
          background: linear-gradient(180deg, var(--primary) 0%, #2a1f4a 100%);
          color: #E5E0D8;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow-y: auto;
          box-shadow: 4px 0 24px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .sidebar-enhanced::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-enhanced::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .sidebar-enhanced::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-logo-container {
          padding: 8px 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.02);
        }

        .nav-link-dynamic {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 10px;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
        }

        .nav-link-dynamic:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #f8fafc;
          transform: translateX(4px);
        }

        .nav-link-dynamic.active {
          background: rgba(0, 143, 215, 0.15); /* var(--secondary) tint */
          color: #ffffff;
          font-weight: 600;
          box-shadow: inset 0 0 0 1px rgba(0, 143, 215, 0.3);
        }

        .nav-link-dynamic.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60%;
          width: 4px;
          background: var(--secondary);
          border-radius: 0 4px 4px 0;
        }

        .sub-menu-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 42px;
          margin-top: 4px;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sub-menu-container::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 0;
          bottom: 16px;
          width: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .sub-nav-link {
          padding: 10px 16px;
          font-size: 0.875rem;
          color: #94a3b8;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }

        .sub-nav-link::before {
          content: '';
          position: absolute;
          left: -18px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }

        .sub-nav-link:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.04);
        }

        .sub-nav-link:hover::before {
          background: var(--secondary);
          width: 16px;
        }

        .sub-nav-link.active {
          color: #ffffff;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.08);
        }

        .sub-nav-link.active::before {
          background: var(--secondary);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <aside className="sidebar-enhanced">
        <div className="sidebar-logo-container">
          <img src={logoBadkom} alt="Logo E-Badkom" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>E-BADKOM</h2>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Sistem Informasi</p>
          </div>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {allNavItems.filter(item => item.roles.includes(level)).map((item) => {
            if (item.subItems) {
              const visibleSubItems = item.subItems.filter(sub => sub.roles.includes(level));
              if (visibleSubItems.length === 0) return null;
              
              const isOpen = openMenus[item.label];

              return (
                <div key={item.label}>
                  <button 
                    className="nav-link-dynamic" 
                    style={{ background: isOpen ? 'rgba(255, 255, 255, 0.04)' : 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <item.icon size={20} color={isOpen ? "#ffffff" : "currentColor"} />
                      <span style={{ color: isOpen ? "#ffffff" : "inherit" }}>{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} color="#ffffff" /> : <ChevronRight size={16} />}
                  </button>
                  {isOpen && (
                    <div className="sub-menu-container">
                      {visibleSubItems.map(subItem => (
                        <Link 
                          key={subItem.path}
                          to={subItem.path} 
                          className={`sub-nav-link ${location.pathname === subItem.path ? 'active' : ''}`}
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
                className={`nav-link-dynamic ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{`
          .top-header-enhanced {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            position: sticky;
            top: 0;
            padding: 16px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(226, 232, 240, 0.6);
            box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.05);
            z-index: 40;
            transition: all 0.3s ease;
          }
          .profile-dropdown-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            padding: 6px 6px 6px 16px;
            border-radius: 40px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          }
          .profile-dropdown-btn:hover {
            border-color: #cbd5e1;
            background: #f8fafc;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .footer-enhanced {
            background: linear-gradient(to right, #f8fafc, #ffffff, #f8fafc);
            padding: 24px 40px;
            text-align: center;
            color: #64748b;
            font-size: 0.875rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
        `}</style>
        <header className="top-header-enhanced">
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
                className="profile-dropdown-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem', lineHeight: '1.2' }}>{currentUser?.fullname || 'Administrator'}</span>
                  <span style={{ fontSize: '0.65rem', color: '#0ea5e9', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>{level.toUpperCase()}</span>
                </div>
                {currentUser?.foto_profil ? (
                  <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${currentUser.foto_profil}`} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #4c1d95 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {currentUser?.fullname?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <ChevronDown size={14} color="#64748b" style={{ marginLeft: '-4px', marginRight: '6px', transition: 'transform 0.2s', transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
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
                  marginTop: '12px', 
                  background: '#ffffff', 
                  borderRadius: '16px', 
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', 
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  zIndex: 100,
                  minWidth: '220px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '8px',
                  animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Login sebagai</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email || currentUser?.username || 'admin'}</p>
                  </div>
                  <Link 
                    to="/admin/profil"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ 
                      padding: '10px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      color: '#334155',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                  >
                    <User size={16} />
                    Profil Saya
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontWeight: 500,
                      textAlign: 'left',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={16} />
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
        
        <footer className="footer-enhanced">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#475569' }}>
            <img src={logoBadkom} alt="Logo" style={{ width: '16px', height: '16px', opacity: 0.6 }} />
            E-Badkom &copy; {new Date().getFullYear()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Sistem Informasi Manajemen Tugas & Evaluasi. Hak Cipta Dilindungi.
          </div>
        </footer>
      </div>

      <Modal 
        isOpen={showLogoutWarning} 
        onClose={() => {}} // Prevent closing by clicking outside
        title="Peringatan Keamanan Sesi"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '10px 0' }}>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%', color: '#d97706' }}>
            <AlertTriangle size={48} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Sesi Akan Berakhir</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {logoutReason} Sesi Anda akan otomatis diakhiri dalam:
            </p>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>
            {logoutCountdown}s
          </div>
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
            <button 
              className="btn" 
              style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}
              onClick={handleLogout}
            >
              Keluar Sekarang
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              onClick={handleStayLoggedIn}
            >
              Tetap Login
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardLayout;
