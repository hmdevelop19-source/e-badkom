import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DialogProvider } from './contexts/DialogContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import SantriPage from './pages/SantriPage';
import BadkomPage from './pages/BadkomPage';
import PjutdPage from './pages/PjutdPage';
import PenugasanPage from './pages/PenugasanPage';
import TahunAjaranPage from './pages/TahunAjaranPage';
import PenilaianPage from './pages/PenilaianPage';
import PenilaianPjutdPage from './pages/PenilaianPjutdPage';
import LaporanSayaPage from './pages/LaporanSayaPage';
import SoalLaporanPage from './pages/SoalLaporanPage';
import SuratPage from './pages/SuratPage';
import MutasiPage from './pages/MutasiPage';
import PenarikanPage from './pages/PenarikanPage';
import UserPage from './pages/UserPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ValidasiBoyongPage from './pages/ValidasiBoyongPage';
import PengajuanBoyongPage from './pages/PengajuanBoyongPage';
import AlumniPage from './pages/AlumniPage';

import LaporanMasukWajibPage from './pages/LaporanMasukWajibPage';
import JadwalLaporanPage from './pages/JadwalLaporanPage';
import LaporanMasukInsidentalPage from './pages/LaporanMasukInsidentalPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><UserPage /></ProtectedRoute>} />
              <Route path="profil" element={<ProfilePage />} />
              <Route path="santri" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><SantriPage /></ProtectedRoute>} />
              <Route path="badkom" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><BadkomPage /></ProtectedRoute>} />
              <Route path="pjutd" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><PjutdPage /></ProtectedRoute>} />
              <Route path="tahun-ajaran" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><TahunAjaranPage /></ProtectedRoute>} />
              <Route path="penugasan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd']}><PenugasanPage /></ProtectedRoute>} />
              <Route path="mutasi" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><MutasiPage /></ProtectedRoute>} />
              <Route path="penarikan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><PenarikanPage /></ProtectedRoute>} />
              <Route path="penilaian" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd']}><PenilaianPage /></ProtectedRoute>} />
              <Route path="penilaian-pjutd" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><PenilaianPjutdPage /></ProtectedRoute>} />
              <Route path="pengajuan-boyong" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><PengajuanBoyongPage /></ProtectedRoute>} />
              <Route path="validasi-boyong" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><ValidasiBoyongPage /></ProtectedRoute>} />
              <Route path="alumni" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><AlumniPage /></ProtectedRoute>} />
              <Route path="laporan-saya" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd', 'utd']}><LaporanSayaPage /></ProtectedRoute>} />
              <Route path="soal-laporan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><SoalLaporanPage /></ProtectedRoute>} />
              <Route path="jadwal-laporan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><JadwalLaporanPage /></ProtectedRoute>} />
              <Route path="laporan-masuk/wajib" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><LaporanMasukWajibPage /></ProtectedRoute>} />
              <Route path="laporan-masuk/insidental" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><LaporanMasukInsidentalPage /></ProtectedRoute>} />
              <Route path="surat" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah', 'pjutd']}><SuratPage /></ProtectedRoute>} />
              <Route path="pengaturan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><SettingsPage /></ProtectedRoute>} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </DialogProvider>
    </QueryClientProvider>
  );
}

export default App;
