import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import axios from 'axios';
import { Save, User, Edit2, X, MapPin, Calendar, Phone, Hash, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilUtdPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    santri_nis: '',
    santri_nik: '',
    santri_tempat_lahir: '',
    santri_tanggal_lahir: '',
    santri_alamat: '',
    santri_desa: '',
    wali_nik: '',
    wali_nama: '',
    wali_no_hp: ''
  });
  const [error, setError] = useState<string | null>(null);

  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [desaList, setDesaList] = useState<any[]>([]);

  const [selectedProvId, setSelectedProvId] = useState<number | ''>('');
  const [selectedKabId, setSelectedKabId] = useState<number | ''>('');
  const [selectedKecId, setSelectedKecId] = useState<number | ''>('');
  
  const initWilayahRef = React.useRef(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profil'],
    queryFn: async () => {
      const response = await api.get('/profil');
      return response.data;
    }
  });

  useEffect(() => {
    if (profile?.santri) {
      setFormData({
        fullname: profile.santri.nama || profile.fullname || '',
        santri_nis: profile.santri.nis || '',
        santri_nik: profile.santri.nik || '',
        santri_tempat_lahir: profile.santri.tempat_lahir || '',
        santri_tanggal_lahir: profile.santri.tanggal_lahir || '',
        santri_alamat: profile.santri.alamat || '',
        santri_desa: profile.santri.desa || '',
        wali_nik: profile.santri.wali?.nik || '',
        wali_nama: profile.santri.wali?.nama_wali || '',
        wali_no_hp: profile.santri.wali?.no_hp || ''
      });
      setSelectedProvId(profile.santri.id_prov || '');
      setSelectedKabId(profile.santri.id_kab || '');
      setSelectedKecId(profile.santri.id_kec || '');
    }
  }, [profile]);

  useEffect(() => {
    if (isEditing && !initWilayahRef.current) {
      const loadWilayah = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const provRes = await axios.get('http://127.0.0.1:8000/api/wilayah/provinsi', config);
          setProvinsiList(provRes.data);
          
          if (profile?.santri?.id_prov) {
            const kabRes = await axios.get(`http://127.0.0.1:8000/api/wilayah/kabupaten/${profile.santri.id_prov}`, config);
            setKabupatenList(kabRes.data);
            
            if (profile?.santri?.id_kab) {
              const kecRes = await axios.get(`http://127.0.0.1:8000/api/wilayah/kecamatan/${profile.santri.id_kab}`, config);
              setKecamatanList(kecRes.data);
              
              if (profile?.santri?.id_kec) {
                const desaRes = await axios.get(`http://127.0.0.1:8000/api/wilayah/kelurahan/${profile.santri.id_kec}`, config);
                setDesaList(desaRes.data);
              }
            }
          }
        } catch (error) {
          console.error('Error loading wilayah:', error);
        }
      };
      loadWilayah();
      initWilayahRef.current = true;
    }
  }, [isEditing, profile]);

  const handleProvinsiChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) {
      setSelectedProvId(''); setSelectedKabId(''); setSelectedKecId('');
      setKabupatenList([]); setKecamatanList([]); setDesaList([]);
      setFormData(prev => ({ ...prev, santri_desa: '' }));
      return;
    }
    setSelectedProvId(id);
    setSelectedKabId(''); setSelectedKecId('');
    setFormData(prev => ({ ...prev, santri_desa: '' }));
    setKabupatenList([]); setKecamatanList([]); setDesaList([]);
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:8000/api/wilayah/kabupaten/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setKabupatenList(res.data);
  };

  const handleKabupatenChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) {
      setSelectedKabId(''); setSelectedKecId('');
      setKecamatanList([]); setDesaList([]);
      setFormData(prev => ({ ...prev, santri_desa: '' }));
      return;
    }
    setSelectedKabId(id);
    setSelectedKecId('');
    setFormData(prev => ({ ...prev, santri_desa: '' }));
    setKecamatanList([]); setDesaList([]);
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:8000/api/wilayah/kecamatan/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setKecamatanList(res.data);
  };

  const handleKecamatanChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) {
      setSelectedKecId('');
      setDesaList([]);
      setFormData(prev => ({ ...prev, santri_desa: '' }));
      return;
    }
    setSelectedKecId(id);
    setFormData(prev => ({ ...prev, santri_desa: '' }));
    setDesaList([]);
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:8000/api/wilayah/kelurahan/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setDesaList(res.data);
  };

  const handleDesaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({ ...prev, santri_desa: '' }));
      return;
    }
    const nama = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({ ...prev, santri_desa: nama }));
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/profil', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Biodata berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['profil'] });
      setError(null);
      setIsEditing(false);
      initWilayahRef.current = false;
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal memperbarui biodata.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const submitData = new FormData();
    submitData.append('fullname', formData.fullname);
    submitData.append('santri_nis', formData.santri_nis);
    submitData.append('santri_nik', formData.santri_nik);
    submitData.append('santri_tempat_lahir', formData.santri_tempat_lahir);
    submitData.append('santri_tanggal_lahir', formData.santri_tanggal_lahir);
    submitData.append('santri_alamat', formData.santri_alamat);
    
    if (selectedProvId) submitData.append('santri_id_prov', String(selectedProvId));
    if (selectedKabId) submitData.append('santri_id_kab', String(selectedKabId));
    if (selectedKecId) submitData.append('santri_id_kec', String(selectedKecId));
    
    const id_kel = formData.santri_desa ? (desaList.find(d => d.nama.toLowerCase() === formData.santri_desa.toLowerCase())?.id || '') : '';
    if (id_kel) submitData.append('santri_id_kel', String(id_kel));

    submitData.append('wali_nik', formData.wali_nik);
    submitData.append('wali_nama', formData.wali_nama);
    submitData.append('wali_no_hp', formData.wali_no_hp);

    mutation.mutate(submitData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile?.santri) {
      setFormData({
        fullname: profile.santri.nama || profile.fullname || '',
        santri_nis: profile.santri.nis || '',
        santri_nik: profile.santri.nik || '',
        santri_tempat_lahir: profile.santri.tempat_lahir || '',
        santri_tanggal_lahir: profile.santri.tanggal_lahir || '',
        santri_alamat: profile.santri.alamat || '',
        santri_desa: profile.santri.desa || '',
        wali_nik: profile.santri.wali?.nik || '',
        wali_nama: profile.santri.wali?.nama_wali || '',
        wali_no_hp: profile.santri.wali?.no_hp || ''
      });
      setSelectedProvId(profile.santri.id_prov || '');
      setSelectedKabId(profile.santri.id_kab || '');
      setSelectedKecId(profile.santri.id_kec || '');
    }
    setError(null);
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat biodata...</div>;
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .profile-header-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 16px !important;
          }
          .profile-header-container .pulse-avatar {
            margin-top: -60px !important;
            transform: rotate(0deg) !important;
          }
          .profile-info-text {
            padding-bottom: 0 !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .header-actions {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px;
          }
          .form-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
      `}</style>
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Profil Dirinya</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Kelola data biodata dan informasi wali Anda.</p>
          </div>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              Edit Biodata
            </button>
          )}
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--primary) 0%, #4c1d95 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          
          <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
            <div className="profile-header-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '24px' }}>
              <div className="pulse-avatar" style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '24px', 
                background: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: '4px solid white',
                position: 'relative',
                zIndex: 2,
                marginTop: '-55px',
                transform: 'rotate(-3deg)',
                transition: 'transform 0.3s ease'
              }} onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-3deg)'}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <User size={50} strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="profile-info-text" style={{ paddingBottom: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {profile?.santri?.nama || profile?.fullname || 'Ustadz Tugas'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
                  <Hash size={16} />
                  <span>NIS: {profile?.santri?.nis || '-'}</span>
                </div>
              </div>
            </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 32px 0' }} />

          {error && (
            <div style={{ padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {!isEditing ? (
            /* View Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Biodata Pribadi */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="var(--primary)" /> Biodata Pribadi
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div className="profile-detail-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Hash size={16} /> NIK
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {profile?.santri?.nik || '-'}
                    </div>
                  </div>
                  <div className="profile-detail-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Calendar size={16} /> Tempat, Tanggal Lahir
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {profile?.santri?.tempat_lahir || '-'}, {profile?.santri?.tanggal_lahir || '-'}
                    </div>
                  </div>
                  <div className="profile-detail-box" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                      <MapPin size={16} /> Alamat Lengkap
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.5' }}>
                      <div style={{ marginBottom: '6px' }}>{profile?.santri?.alamat || 'Alamat belum dilengkapi.'}</div>
                      {[profile?.santri?.desa, profile?.santri?.kecamatan, profile?.santri?.kabupaten, profile?.santri?.provinsi].filter(Boolean).length > 0 && (
                        <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                          {[profile?.santri?.desa, profile?.santri?.kecamatan, profile?.santri?.kabupaten, profile?.santri?.provinsi].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Wali */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--primary)" /> Data Wali
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div className="profile-detail-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                      <User size={16} /> Nama Wali
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {profile?.santri?.wali?.nama_wali || '-'}
                    </div>
                  </div>
                  <div className="profile-detail-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Hash size={16} /> NIK Wali
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {profile?.santri?.wali?.nik || '-'}
                    </div>
                  </div>
                  <div className="profile-detail-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Phone size={16} /> No. HP Wali
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {profile?.santri?.wali?.no_hp || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', margin: 0 }}>Biodata Pribadi</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input type="text" className="form-control" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIS</label>
                    <input type="text" className="form-control" value={formData.santri_nis} onChange={(e) => setFormData({...formData, santri_nis: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIK</label>
                    <input type="text" className="form-control" value={formData.santri_nik} onChange={(e) => setFormData({...formData, santri_nik: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tempat Lahir</label>
                    <input type="text" className="form-control" value={formData.santri_tempat_lahir} onChange={(e) => setFormData({...formData, santri_tempat_lahir: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Lahir</label>
                    <input type="date" className="form-control" value={formData.santri_tanggal_lahir} onChange={(e) => setFormData({...formData, santri_tanggal_lahir: e.target.value})} />
                  </div>
                </div>

                {/* Wilayah Dropdowns */}
                <div className="form-grid-2" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div className="form-group">
                    <label className="form-label">Provinsi</label>
                    <select className="form-control" value={selectedProvId} onChange={handleProvinsiChange}>
                      <option value="">Pilih Provinsi</option>
                      {provinsiList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kabupaten/Kota</label>
                    <select className="form-control" value={selectedKabId} onChange={handleKabupatenChange} disabled={!selectedProvId}>
                      <option value="">Pilih Kabupaten/Kota</option>
                      {kabupatenList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kecamatan</label>
                    <select className="form-control" value={selectedKecId} onChange={handleKecamatanChange} disabled={!selectedKabId}>
                      <option value="">Pilih Kecamatan</option>
                      {kecamatanList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Desa/Kelurahan</label>
                    <select className="form-control" value={formData.santri_desa ? (desaList.find(d => d.nama.toLowerCase() === formData.santri_desa.toLowerCase())?.id || '') : ''} onChange={handleDesaChange} disabled={!selectedKecId}>
                      <option value="">Pilih Desa/Kelurahan</option>
                      {desaList.map(d => (
                        <option key={d.id} value={d.id}>{d.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea className="form-control" rows={3} value={formData.santri_alamat} onChange={(e) => setFormData({...formData, santri_alamat: e.target.value})} placeholder="Nama jalan, RT/RW, Dusun, dll" />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', margin: 0 }}>Data Wali</h3>
                <div className="form-group">
                  <label className="form-label">Nama Wali</label>
                  <input type="text" className="form-control" value={formData.wali_nama} onChange={(e) => setFormData({...formData, wali_nama: e.target.value})} required />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">NIK Wali</label>
                    <input type="text" className="form-control" value={formData.wali_nik} onChange={(e) => setFormData({...formData, wali_nik: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. HP Wali</label>
                    <input type="text" className="form-control" value={formData.wali_no_hp} onChange={(e) => setFormData({...formData, wali_no_hp: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn" onClick={handleCancel} disabled={mutation.isPending} style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                  <X size={18} /> Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                  <Save size={18} />
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ProfilUtdPage;
