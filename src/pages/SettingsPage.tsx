import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Settings, Save, Upload, Image as ImageIcon, CheckCircle, Shield, FileText, Calendar } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [kopFile, setKopFile] = useState<File | null>(null);
  const [kopPreview, setKopPreview] = useState<string | null>(null);
  const [kopLaporanUtdFile, setKopLaporanUtdFile] = useState<File | null>(null);
  const [kopLaporanUtdPreview, setKopLaporanUtdPreview] = useState<string | null>(null);
  const [kopLaporanPjutdFile, setKopLaporanPjutdFile] = useState<File | null>(null);
  const [kopLaporanPjutdPreview, setKopLaporanPjutdPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputUtdRef = useRef<HTMLInputElement>(null);
  const fileInputPjutdRef = useRef<HTMLInputElement>(null);
  const [isHoveringUpload, setIsHoveringUpload] = useState(false);
  const [isHoveringUploadUtd, setIsHoveringUploadUtd] = useState(false);
  const [isHoveringUploadPjutd, setIsHoveringUploadPjutd] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  useEffect(() => {
    if (settings.length > 0) {
      const initialData: { [key: string]: string } = {};
      settings.forEach((s: any) => {
        initialData[s.key] = s.value;
      });
      setFormData(initialData);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { settings: { key: string, value: string }[] }) => 
      api.post('/settings/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan pengaturan.' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const uploadKopMutation = useMutation({
    mutationFn: (file: File) => {
      const formPayload = new FormData();
      formPayload.append('kop_surat', file);
      return api.post('/settings/kop', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setKopFile(null);
      setMessage({ type: 'success', text: 'Kop Surat berhasil diunggah!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengunggah Kop Surat.' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const uploadKopLaporanUtdMutation = useMutation({
    mutationFn: (file: File) => {
      const formPayload = new FormData();
      formPayload.append('kop_laporan_utd', file);
      return api.post('/settings/kop-laporan-utd', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setKopLaporanUtdFile(null);
      setMessage({ type: 'success', text: 'Kop Surat Laporan UT-D berhasil diunggah!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengunggah Kop Surat Laporan UT-D.' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const uploadKopLaporanPjutdMutation = useMutation({
    mutationFn: (file: File) => {
      const formPayload = new FormData();
      formPayload.append('kop_laporan_pjutd', file);
      return api.post('/settings/kop-laporan-pjutd', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setKopLaporanPjutdFile(null);
      setMessage({ type: 'success', text: 'Kop Surat Laporan PJUT-D berhasil diunggah!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengunggah Kop Surat Laporan PJUT-D.' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.keys(formData).map(key => ({
      key,
      value: formData[key]
    }));
    updateSettingsMutation.mutate({ settings: payload });
    
    if (kopFile) {
      uploadKopMutation.mutate(kopFile);
    }
    if (kopLaporanUtdFile) {
      uploadKopLaporanUtdMutation.mutate(kopLaporanUtdFile);
    }
    if (kopLaporanPjutdFile) {
      uploadKopLaporanPjutdMutation.mutate(kopLaporanPjutdFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'utama' | 'utd' | 'pjutd' = 'utama') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'utama') setKopFile(file);
      else if (type === 'utd') setKopLaporanUtdFile(file);
      else if (type === 'pjutd') setKopLaporanPjutdFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'utama') setKopPreview(e.target?.result as string);
        else if (type === 'utd') setKopLaporanUtdPreview(e.target?.result as string);
        else if (type === 'pjutd') setKopLaporanPjutdPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Memuat Pengaturan Sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .setting-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #f1f5f9;
        }
        .setting-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }
        .setting-header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .setting-body {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .setting-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .setting-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        .setting-label-group h3 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .setting-label-group p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .setting-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .styled-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #f8fafc;
        }
        .styled-input:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          outline: none;
        }
        .styled-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 48px;
        }
        .upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
        }
        .upload-zone:hover, .upload-zone.drag-active {
          border-color: var(--primary);
          background: #f0fdf4;
        }
        .floating-save {
          position: sticky;
          bottom: 24px;
          z-index: 50;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          padding: 16px 24px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
      `}</style>

      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Pengaturan Sistem</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>Kelola preferensi dan konfigurasi global aplikasi E-Badkom.</p>
      </div>
      
      {message && (
        <div style={{ 
          padding: '16px 24px', 
          borderRadius: '12px', 
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <Shield size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Section: Penilaian & Laporan */}
        <div className="setting-section">
          <div className="setting-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Laporan & Penilaian</h2>
          </div>
          <div className="setting-body">
            
            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Target Penilaian Lulus</h3>
                <p>Jumlah minimum nilai "Lulus" yang harus dicapai Santri dari tugas UT-D agar status tanggungannya dianggap selesai.</p>
              </div>
              <div className="setting-input-group">
                <input 
                  type="number" 
                  className="styled-input" 
                  value={formData['target_tugas_wajib'] || ''} 
                  onChange={(e) => handleInputChange('target_tugas_wajib', e.target.value)}
                  min="1" max="20" required
                />
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9' }}></div>

            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Jumlah Maksimal Bulan Laporan</h3>
                <p>Batas jumlah laporan wajib bulanan. Dropdown bulan pada form pelaporan akan otomatis menyesuaikan batas ini.</p>
              </div>
              <div className="setting-input-group">
                <input 
                  type="number" 
                  className="styled-input" 
                  value={formData['max_bulan_laporan'] || ''} 
                  onChange={(e) => handleInputChange('max_bulan_laporan', e.target.value)}
                  min="1" max="24" required
                />
              </div>
            </div>

          </div>
        </div>

        {/* Section: Akses & Keamanan */}
        <div className="setting-section">
          <div className="setting-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Akses & Keamanan</h2>
          </div>
          <div className="setting-body">
            
            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Akses Penilaian Akhir Tahun</h3>
                <p>Buka saklar ini hanya ketika memasuki akhir tahun ajaran. Ini akan memberikan izin kepada PJU-TD dan Wilayah untuk memberikan nilai kelulusan akhir.</p>
              </div>
              <div className="setting-input-group">
                <select 
                  className="styled-input styled-select" 
                  value={formData['is_penilaian_opened'] || 'false'} 
                  onChange={(e) => handleInputChange('is_penilaian_opened', e.target.value)}
                  style={{ 
                    background: formData['is_penilaian_opened'] === 'true' ? '#ecfdf5' : '#fff1f2',
                    borderColor: formData['is_penilaian_opened'] === 'true' ? '#10b981' : '#ef4444',
                    color: formData['is_penilaian_opened'] === 'true' ? '#065f46' : '#991b1b',
                    fontWeight: 600
                  }}
                >
                  <option value="false">🔒 Ditutup (Terkunci)</option>
                  <option value="true">🔓 Dibuka (Bisa Dinilai)</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Section: Dokumen & Surat */}
        <div className="setting-section">
          <div className="setting-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dokumen & Persuratan</h2>
          </div>
          <div className="setting-body">
            
            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Koordinator Tugas & Da'i</h3>
                <p>Nama penanggung jawab yang akan dicetak dan menandatangani Surat Kelulusan Tugas (Surat Boyong).</p>
              </div>
              <div className="setting-input-group">
                <input 
                  type="text" 
                  className="styled-input" 
                  value={formData['nama_koordinator_tugas'] || ''} 
                  onChange={(e) => handleInputChange('nama_koordinator_tugas', e.target.value)}
                  placeholder="Contoh: UST. SAIFUL BARI"
                  required
                />
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9' }}></div>

            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Kop Surat Resmi (PDF/Cetak)</h3>
                <p>Unggah gambar dengan resolusi tinggi (rasio memanjang) yang akan digunakan sebagai kop surat resmi di seluruh dokumen aplikasi.</p>
              </div>
              <div className="setting-input-group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                
                <div 
                  className={`upload-zone ${isHoveringUpload ? 'drag-active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setIsHoveringUpload(true)}
                  onMouseLeave={() => setIsHoveringUpload(false)}
                >
                  {(kopPreview || formData['kop_surat']) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <img 
                          src={kopPreview || (import.meta.env.VITE_API_URL.replace('/api', '') + '/' + formData['kop_surat'])} 
                          alt="Kop Preview" 
                          style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '4px' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                        <Upload size={16} /> {kopFile ? kopFile.name : 'Klik untuk mengubah gambar'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Klik untuk mengunggah</span> atau seret gambar ke sini
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>PNG, JPG maksimal 2MB</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9' }}></div>

            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Kop Surat Laporan UT-D (Khusus Laporan Wajib)</h3>
                <p>Kop surat spesifik untuk format laporan wajib dari Ustadz Tugas (UT-D).</p>
              </div>
              <div className="setting-input-group">
                <input 
                  type="file" 
                  ref={fileInputUtdRef}
                  style={{ display: 'none' }}
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, 'utd')}
                />
                
                <div 
                  className={`upload-zone ${isHoveringUploadUtd ? 'drag-active' : ''}`}
                  onClick={() => fileInputUtdRef.current?.click()}
                  onMouseEnter={() => setIsHoveringUploadUtd(true)}
                  onMouseLeave={() => setIsHoveringUploadUtd(false)}
                >
                  {(kopLaporanUtdPreview || formData['kop_laporan_utd']) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <img 
                          src={kopLaporanUtdPreview || (import.meta.env.VITE_API_URL.replace('/api', '') + '/' + formData['kop_laporan_utd'])} 
                          alt="Kop Laporan UT-D Preview" 
                          style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '4px' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                        <Upload size={16} /> {kopLaporanUtdFile ? kopLaporanUtdFile.name : 'Klik untuk mengubah gambar'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Klik untuk mengunggah</span> atau seret gambar ke sini
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>PNG, JPG maksimal 2MB</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9' }}></div>

            <div className="setting-row">
              <div className="setting-label-group">
                <h3>Kop Surat Laporan PJUT-D (Khusus Laporan Wajib)</h3>
                <p>Kop surat spesifik untuk format laporan wajib dari Penanggung Jawab Ustadz Tugas Daerah (PJUT-D).</p>
              </div>
              <div className="setting-input-group">
                <input 
                  type="file" 
                  ref={fileInputPjutdRef}
                  style={{ display: 'none' }}
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, 'pjutd')}
                />
                
                <div 
                  className={`upload-zone ${isHoveringUploadPjutd ? 'drag-active' : ''}`}
                  onClick={() => fileInputPjutdRef.current?.click()}
                  onMouseEnter={() => setIsHoveringUploadPjutd(true)}
                  onMouseLeave={() => setIsHoveringUploadPjutd(false)}
                >
                  {(kopLaporanPjutdPreview || formData['kop_laporan_pjutd']) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <img 
                          src={kopLaporanPjutdPreview || (import.meta.env.VITE_API_URL.replace('/api', '') + '/' + formData['kop_laporan_pjutd'])} 
                          alt="Kop Laporan PJUT-D Preview" 
                          style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '4px' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                        <Upload size={16} /> {kopLaporanPjutdFile ? kopLaporanPjutdFile.name : 'Klik untuk mengubah gambar'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Klik untuk mengunggah</span> atau seret gambar ke sini
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>PNG, JPG maksimal 2MB</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Save Button */}
        <div className="floating-save">
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Simpan Perubahan</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Jangan lupa menyimpan setelah mengubah konfigurasi.</div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={updateSettingsMutation.isPending || uploadKopMutation.isPending || uploadKopLaporanUtdMutation.isPending || uploadKopLaporanPjutdMutation.isPending}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              borderRadius: '30px'
            }}
          >
            <Save size={20} />
            {updateSettingsMutation.isPending || uploadKopMutation.isPending || uploadKopLaporanUtdMutation.isPending || uploadKopLaporanPjutdMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
