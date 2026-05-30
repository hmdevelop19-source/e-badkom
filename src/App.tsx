import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DialogProvider } from './contexts/DialogContext';
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
import UserPage from './pages/UserPage';
import SettingsPage from './pages/SettingsPage';
import ValidasiBoyongPage from './pages/ValidasiBoyongPage';
import PengajuanBoyongPage from './pages/PengajuanBoyongPage';
import AlumniPage from './pages/AlumniPage';

import LaporanMasukWajibPage from './pages/LaporanMasukWajibPage';
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
              <Route path="users" element={<UserPage />} />
              <Route path="santri" element={<SantriPage />} />
              <Route path="badkom" element={<BadkomPage />} />
              <Route path="pjutd" element={<PjutdPage />} />
              <Route path="tahun-ajaran" element={<TahunAjaranPage />} />
              <Route path="penugasan" element={<PenugasanPage />} />
              <Route path="penilaian" element={<PenilaianPage />} />
              <Route path="penilaian-pjutd" element={<PenilaianPjutdPage />} />
              <Route path="pengajuan-boyong" element={<PengajuanBoyongPage />} />
              <Route path="validasi-boyong" element={<ValidasiBoyongPage />} />
              <Route path="alumni" element={<AlumniPage />} />
              <Route path="laporan-saya" element={<LaporanSayaPage />} />
              <Route path="soal-laporan" element={<SoalLaporanPage />} />
              <Route path="laporan-masuk/wajib" element={<LaporanMasukWajibPage />} />
              <Route path="laporan-masuk/insidental" element={<LaporanMasukInsidentalPage />} />
              <Route path="surat" element={<SuratPage />} />
              <Route path="pengaturan" element={<SettingsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </DialogProvider>
    </QueryClientProvider>
  );
}

export default App;
