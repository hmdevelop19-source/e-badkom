import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Briefcase, Award, ClipboardCheck, Archive, Settings } from 'lucide-react';
import Sidebar, { type NavItem } from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AutoLogout from '../../components/layout/AutoLogout';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUserStr, setCurrentUserStr] = useState(localStorage.getItem('user'));
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

  const rawNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
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
      roles: ['admin', 'badkom_pusat', 'badkom_wilayah'],
      subItems: [
        { label: 'Laporan Saya (Isi Laporan)', path: '/admin/laporan-saya', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Surat', path: '/admin/surat', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Laporan Wajib (Laporan Masuk)', path: '/admin/laporan-masuk/wajib', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
        { label: 'Laporan Insidental (Laporan Masuk)', path: '/admin/laporan-masuk/insidental', roles: ['admin', 'badkom_pusat', 'badkom_wilayah'] },
      ]
    },
    {
      label: 'Pengaturan',
      icon: Settings,
      roles: ['admin', 'badkom_pusat'],
      subItems: [
        { label: 'Laporan (Pembuatan Soal)', path: '/admin/soal-laporan', roles: ['admin', 'badkom_pusat'] },
        { label: 'Jadwal Laporan Wajib', path: '/admin/jadwal-laporan', roles: ['admin', 'badkom_pusat'] },
        { label: 'Manajemen Akun', path: '/admin/users', roles: ['admin', 'badkom_pusat'] },
        { label: 'Pengaturan Sistem', path: '/admin/pengaturan', roles: ['admin', 'badkom_pusat'] },
        { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', roles: ['admin', 'badkom_pusat'] },
      ]
    }
  ];

  // Filter items based on user level
  const navItems: NavItem[] = rawNavItems
    .filter(item => item.roles.includes(level))
    .map(item => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => sub.roles.includes(level))
        };
      }
      return item;
    })
    .filter(item => !item.subItems || item.subItems.length > 0);

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard Overview';
    const flatItems = rawNavItems.flatMap(i => [i, ...(i.subItems || [])]);
    const found = flatItems.find(i => i.path === location.pathname);
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
          profileLink="/admin/profil"
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

export default AdminLayout;
