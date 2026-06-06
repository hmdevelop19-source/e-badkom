import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DialogProvider } from './contexts/DialogContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Layouts
import AdminLayout from './layouts/admin/AdminLayout';
import PjutdLayout from './layouts/pjutd/PjutdLayout';
import UtdLayout from './layouts/utd/UtdLayout';

// Pages
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
import RiwayatUtdPage from './pages/RiwayatUtdPage';
import RiwayatTempatTugasPage from './pages/RiwayatTempatTugasPage';
import ProfilLembagaPage from './pages/ProfilLembagaPage';
import ProfilUtdPage from './pages/ProfilUtdPage';
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
            
            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat', 'badkom_wilayah']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserPage />} />
              <Route path="profil" element={<ProfilePage />} />
              <Route path="santri" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><SantriPage /></ProtectedRoute>} />
              <Route path="badkom" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><BadkomPage /></ProtectedRoute>} />
              <Route path="pjutd" element={<PjutdPage />} />
              <Route path="tahun-ajaran" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><TahunAjaranPage /></ProtectedRoute>} />
              <Route path="penugasan" element={<PenugasanPage />} />
              <Route path="mutasi" element={<MutasiPage />} />
              <Route path="penarikan" element={<PenarikanPage />} />
              <Route path="penilaian" element={<PenilaianPage />} />
              <Route path="penilaian-pjutd" element={<PenilaianPjutdPage />} />
              <Route path="pengajuan-boyong" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><PengajuanBoyongPage /></ProtectedRoute>} />
              <Route path="validasi-boyong" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><ValidasiBoyongPage /></ProtectedRoute>} />
              <Route path="alumni" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><AlumniPage /></ProtectedRoute>} />
              <Route path="laporan-saya" element={<LaporanSayaPage />} />
              <Route path="soal-laporan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><SoalLaporanPage /></ProtectedRoute>} />
              <Route path="jadwal-laporan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><JadwalLaporanPage /></ProtectedRoute>} />
              <Route path="laporan-masuk/wajib" element={<LaporanMasukWajibPage />} />
              <Route path="laporan-masuk/insidental" element={<LaporanMasukInsidentalPage />} />
              <Route path="surat" element={<SuratPage />} />
              <Route path="pengaturan" element={<ProtectedRoute allowedRoles={['admin', 'badkom_pusat']}><SettingsPage /></ProtectedRoute>} />
            </Route>

            {/* PJUTD ROUTES */}
            <Route path="/pjutd" element={<ProtectedRoute allowedRoles={['pjutd']}><PjutdLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="profil-lembaga" element={<ProfilLembagaPage />} />
              <Route path="laporan-saya" element={<LaporanSayaPage />} />
              <Route path="surat" element={<SuratPage />} />
              <Route path="riwayat-utd" element={<RiwayatUtdPage />} />
              <Route path="profil" element={<ProfilePage />} />
            </Route>

            {/* UTD ROUTES */}
            <Route path="/utd" element={<ProtectedRoute allowedRoles={['utd']}><UtdLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="profil-utd" element={<ProfilUtdPage />} />
              <Route path="riwayat-tempat-tugas" element={<RiwayatTempatTugasPage />} />
              <Route path="laporan-saya" element={<LaporanSayaPage />} />
              <Route path="profil" element={<ProfilePage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </DialogProvider>
    </QueryClientProvider>
  );
}

export default App;
