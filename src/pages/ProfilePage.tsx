import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Camera, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    old_password: '',
    password: '',
    password_confirmation: ''
  });
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profil'],
    queryFn: async () => {
      const response = await api.get('/profil');
      return response.data;
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username || '',
        fullname: profile.fullname || ''
      }));
      if (profile.foto_profil) {
        setFotoUrl(`${import.meta.env.VITE_API_URL?.replace('/api', '')}${profile.foto_profil}`);
      }
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/profil', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['profil'] });
      setFormData(prev => ({ ...prev, old_password: '', password: '', password_confirmation: '' }));
      setSelectedFile(null);
      setError(null);
      
      // Update local storage user data
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));
        // Dispatch custom event to update Sidebar/Header
        window.dispatchEvent(new Event('user-profile-updated'));
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal memperbarui profil.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (formData.password && !formData.old_password) {
      setError('Password lama wajib diisi untuk mengubah password.');
      return;
    }

    const submitData = new FormData();
    submitData.append('username', formData.username);
    submitData.append('fullname', formData.fullname);
    
    if (formData.password) {
      submitData.append('old_password', formData.old_password);
      submitData.append('password', formData.password);
    }
    
    if (selectedFile) {
      submitData.append('foto_profil', selectedFile);
    }

    mutation.mutate(submitData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFotoUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat profil...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>Pengaturan Profil</h2>
        
        {error && (
          <div style={{ padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '40px' }}>
          {/* Bagian Foto Profil */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '4px solid white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={64} color="#cbd5e1" />
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '8px',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <Camera size={16} style={{ margin: '0 auto' }} />
              </div>
            </div>
            <button 
              type="button"
              className="btn" 
              style={{ background: 'white', border: '1px solid #e2e8f0', width: '100%' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Ganti Foto
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Format diperbolehkan: JPG, PNG. Max 2MB.
            </p>
          </div>

          {/* Bagian Form Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', margin: 0 }}>Ubah Password</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Kosongkan jika tidak ingin mengubah password.</p>
              
              <div className="form-group">
                <label className="form-label">Password Lama</label>
                <input 
                  type="password" 
                  className="form-control"
                  value={formData.old_password}
                  onChange={(e) => setFormData({...formData, old_password: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <input 
                    type="password" 
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ulangi Password Baru</label>
                  <input 
                    type="password" 
                    className="form-control"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                <Save size={18} />
                {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
