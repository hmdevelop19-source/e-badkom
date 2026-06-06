import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Archive, ClipboardCheck, Briefcase } from 'lucide-react';
import Sidebar, { type NavItem } from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AutoLogout from '../../components/layout/AutoLogout';

const PjutdLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserStr = useState(localStorage.getItem('user'))[0];
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserStr) {
      navigate('/login');
    }
  }, [navigate, currentUserStr]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUserStr(localStorage.getItem('user'));
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/pjutd', icon: LayoutDashboard },
    { label: 'Profil Lembaga', path: '/pjutd/profil-lembaga', icon: Database },
    { label: 'Laporan', path: '/pjutd/laporan-saya', icon: Archive },
    { label: 'Surat', path: '/pjutd/surat', icon: ClipboardCheck },
    { label: 'Riwayat UT-D', path: '/pjutd/riwayat-utd', icon: Briefcase },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/pjutd') return 'Dashboard Overview';
    const found = navItems.find(i => i.path === location.pathname);
    return found?.label || 'E-Badkom';
  };

  return (
    <div className="layout-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar 
        navItems={navItems} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header 
          title={getPageTitle()}
          currentUser={currentUser}
          level={level}
          onLogout={handleLogout}
          profileLink="/pjutd/profil"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ paddingBottom: '40px' }}>
            <Outlet />
          </div>
        </main>
        
        <Footer />
      </div>

      <AutoLogout onLogout={handleLogout} />
    </div>
  );
};

export default PjutdLayout;
