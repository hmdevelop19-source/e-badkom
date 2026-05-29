import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Settings, Save, Upload, Image as ImageIcon } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [kopFile, setKopFile] = useState<File | null>(null);
  const [kopPreview, setKopPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  });

  const uploadKopMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('kop_surat', file);
      return api.post('/settings/kop', formData, {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKopFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setKopPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat pengaturan...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <Settings size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Pengaturan Sistem</h2>
        </div>
        
        {message && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 500
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Target Tugas Wajib */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Target Penilaian Lulus (Tugas Wajib UTD)</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '8px' }}>
              Jumlah minimum nilai "Lulus" yang harus dicapai Santri (dan divalidasi oleh Wilayah/Pusat) agar status tanggungannya dianggap selesai.
            </p>
            <input 
              type="number" 
              className="form-control" 
              value={formData['target_tugas_wajib'] || ''} 
              onChange={(e) => handleInputChange('target_tugas_wajib', e.target.value)}
              min="1"
              max="20"
              required
              style={{ maxWidth: '200px' }}
            />
          </div>

          {/* Nama Koordinator Tugas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nama Koordinator Tugas & Da'i</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '8px' }}>
              Nama penanggung jawab yang akan menandatangani Surat Kelulusan Tugas (Surat Boyong).
            </p>
            <input 
              type="text" 
              className="form-control" 
              value={formData['nama_koordinator_tugas'] || ''} 
              onChange={(e) => handleInputChange('nama_koordinator_tugas', e.target.value)}
              placeholder="Contoh: SAIFUL BARI"
              required
              style={{ maxWidth: '400px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Gambar Kop Surat (PDF)</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '16px' }}>
              Unggah gambar yang akan menjadi Kop Surat untuk seluruh dokumen PDF (Surat Lulus, Laporan, dll). Rasio memanjang disarankan.
            </p>
            
            {(kopPreview || formData['kop_surat']) && (
              <div style={{ marginBottom: '16px', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={kopPreview || (import.meta.env.VITE_API_URL.replace('/api', '') + '/' + formData['kop_surat'])} 
                  alt="Kop Preview" 
                  style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} 
                />
              </div>
            )}
            
            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
              />
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {kopFile ? <ImageIcon size={18} /> : <Upload size={18} />}
                {kopFile ? 'Ubah Pilihan Gambar' : 'Pilih Gambar Kop Baru'}
              </button>
              {kopFile && <span style={{ marginLeft: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{kopFile.name} (siap disimpan)</span>}
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={updateSettingsMutation.isPending || uploadKopMutation.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              <Save size={18} />
              {updateSettingsMutation.isPending || uploadKopMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
