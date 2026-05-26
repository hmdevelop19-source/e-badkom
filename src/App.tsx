import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import SantriPage from './pages/SantriPage';
import BadkomPage from './pages/BadkomPage';
import PjutdPage from './pages/PjutdPage';
import PenugasanPage from './pages/PenugasanPage';
import TahunAjaranPage from './pages/TahunAjaranPage';
import PenilaianPage from './pages/PenilaianPage';
import LaporanPage from './pages/LaporanPage';
import SuratPage from './pages/SuratPage';
import UserPage from './pages/UserPage';

import LaporanMasukWajibPage from './pages/LaporanMasukWajibPage';
import LaporanMasukInsidentalPage from './pages/LaporanMasukInsidentalPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
            <Route path="laporan" element={<LaporanPage />} />
            <Route path="laporan-masuk/wajib" element={<LaporanMasukWajibPage />} />
            <Route path="laporan-masuk/insidental" element={<LaporanMasukInsidentalPage />} />
            <Route path="surat" element={<SuratPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
