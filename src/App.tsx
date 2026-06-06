import React, { Suspense, lazy } from 'react';
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
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SantriPage = lazy(() => import('./pages/SantriPage'));
const BadkomPage = lazy(() => import('./pages/BadkomPage'));
const PjutdPage = lazy(() => import('./pages/PjutdPage'));
const PenugasanPage = lazy(() => import('./pages/PenugasanPage'));
const TahunAjaranPage = lazy(() => import('./pages/TahunAjaranPage'));
const PenilaianPage = lazy(() => import('./pages/PenilaianPage'));
const PenilaianPjutdPage = lazy(() => import('./pages/PenilaianPjutdPage'));
const LaporanSayaPage = lazy(() => import('./pages/LaporanSayaPage'));
const SoalLaporanPage = lazy(() => import('./pages/SoalLaporanPage'));
const SuratPage = lazy(() => import('./pages/SuratPage'));
const MutasiPage = lazy(() => import('./pages/MutasiPage'));
const PenarikanPage = lazy(() => import('./pages/PenarikanPage'));
const UserPage = lazy(() => import('./pages/UserPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ValidasiBoyongPage = lazy(() => import('./pages/ValidasiBoyongPage'));
const PengajuanBoyongPage = lazy(() => import('./pages/PengajuanBoyongPage'));
const AlumniPage = lazy(() => import('./pages/AlumniPage'));
const RiwayatUtdPage = lazy(() => import('./pages/RiwayatUtdPage'));
const RiwayatTempatTugasPage = lazy(() => import('./pages/RiwayatTempatTugasPage'));
const ProfilLembagaPage = lazy(() => import('./pages/ProfilLembagaPage'));
const ProfilUtdPage = lazy(() => import('./pages/ProfilUtdPage'));
const LaporanMasukWajibPage = lazy(() => import('./pages/LaporanMasukWajibPage'));
const JadwalLaporanPage = lazy(() => import('./pages/JadwalLaporanPage'));
const LaporanMasukInsidentalPage = lazy(() => import('./pages/LaporanMasukInsidentalPage'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Router>
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}><div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style></div>}>
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
          </Suspense>
        </Router>
      </DialogProvider>
    </QueryClientProvider>
  );
}

export default App;
