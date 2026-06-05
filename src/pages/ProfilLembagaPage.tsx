import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, Save, Edit2, X, Phone, MapPin, School, BookOpen, Key, Hash } from 'lucide-react';

const ProfilLembagaPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pjutdData, setPjutdData] = useState<any>(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const pjutdId = user?.pjutd_id;

  const [formData, setFormData] = useState({
    kode_lembaga: '',
    badkom_id: '',
    nama_pjutd: '',
    nama_madrasah: '',
    yayasan: '',
    no_hp: '',
    alamat: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    desa: ''
  });

  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [desaList, setDesaList] = useState<any[]>([]);

  const [selectedProvId, setSelectedProvId] = useState<number | ''>('');
  const [selectedKabId, setSelectedKabId] = useState<number | ''>('');
  const [selectedKecId, setSelectedKecId] = useState<number | ''>('');

  const initWilayahRef = React.useRef(false);

  useEffect(() => {
    if (isEditing && !initWilayahRef.current) {
      const loadWilayah = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const provRes = await axios.get('http://127.0.0.1:8000/api/wilayah/provinsi', config);
          setProvinsiList(provRes.data);
          
          if (pjutdData?.provinsi) {
            const matchProv = provRes.data.find((p: any) => p.nama.toLowerCase() === pjutdData.provinsi.toLowerCase());
            if (matchProv) {
              setSelectedProvId(matchProv.id);
              
              const kabRes = await axios.get(`http://127.0.0.1:8000/api/wilayah/kabupaten/${matchProv.id}`, config);
              setKabupatenList(kabRes.data);
              
              if (pjutdData.kabupaten) {
                const matchKab = kabRes.data.find((p: any) => p.nama.toLowerCase() === pjutdData.kabupaten.toLowerCase());
                if (matchKab) {
                  setSelectedKabId(matchKab.id);
                  
                  const kecRes = await axios.get(`http://127.0.0.1:8000/api/wilayah/kecamatan/${matchKab.id}`, config);
                  setKecamatanList(kecRes.data);
                  
                  if (pjutdData.kecamatan) {
                    const matchKec = kecRes.data.find((p: any) => p.nama.toLowerCase() === pjutdData.kecamatan.toLowerCase());
                    if (matchKec) {
                      setSelectedKecId(matchKec.id);
                      
                      const desaRes = await axios.get(`http://127.0.0.1:8000/api/wilayah/kelurahan/${matchKec.id}`, config);
                      setDesaList(desaRes.data);
                    }
                  }
                }
              }
            }
          }
          initWilayahRef.current = true;
        } catch (e) {
          console.error('Gagal memuat data wilayah:', e);
        }
      };
      loadWilayah();
    }
    
    if (!isEditing) {
      initWilayahRef.current = false;
    }
  }, [isEditing, pjutdData]);

  const handleProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedProvId('');
      setFormData(prev => ({ ...prev, provinsi: '', kabupaten: '', kecamatan: '', desa: '' }));
      setSelectedKabId('');
      setSelectedKecId('');
      setKabupatenList([]);
      setKecamatanList([]);
      setDesaList([]);
      return;
    }
    const id = Number(val);
    const nama = e.target.options[e.target.selectedIndex].text;
    setSelectedProvId(id);
    setFormData(prev => ({ ...prev, provinsi: nama, kabupaten: '', kecamatan: '', desa: '' }));
    setSelectedKabId('');
    setSelectedKecId('');
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:8000/api/wilayah/kabupaten/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setKabupatenList(res.data);
  };

  const handleKabChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedKabId('');
      setFormData(prev => ({ ...prev, kabupaten: '', kecamatan: '', desa: '' }));
      setSelectedKecId('');
      setKecamatanList([]);
      setDesaList([]);
      return;
    }
    const id = Number(val);
    const nama = e.target.options[e.target.selectedIndex].text;
    setSelectedKabId(id);
    setFormData(prev => ({ ...prev, kabupaten: nama, kecamatan: '', desa: '' }));
    setSelectedKecId('');
    setKecamatanList([]);
    setDesaList([]);
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:8000/api/wilayah/kecamatan/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setKecamatanList(res.data);
  };

  const handleKecChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedKecId('');
      setFormData(prev => ({ ...prev, kecamatan: '', desa: '' }));
      setDesaList([]);
      return;
    }
    const id = Number(val);
    const nama = e.target.options[e.target.selectedIndex].text;
    setSelectedKecId(id);
    setFormData(prev => ({ ...prev, kecamatan: nama, desa: '' }));
    setDesaList([]);
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:8000/api/wilayah/kelurahan/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setDesaList(res.data);
  };

  const handleDesaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({ ...prev, desa: '' }));
      return;
    }
    const nama = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({ ...prev, desa: nama }));
  };

  const fetchProfilLembaga = async () => {
    if (!pjutdId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/pjutd/${pjutdId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPjutdData(response.data);
      setFormData({
        kode_lembaga: response.data.kode_lembaga || '',
        badkom_id: response.data.badkom_id || '',
        nama_pjutd: response.data.nama_pjutd || '',
        nama_madrasah: response.data.nama_madrasah || '',
        yayasan: response.data.yayasan || '',
        no_hp: response.data.no_hp || '',
        alamat: response.data.alamat || '',
        provinsi: response.data.provinsi || '',
        kabupaten: response.data.kabupaten || '',
        kecamatan: response.data.kecamatan || '',
        desa: response.data.desa || ''
      });
    } catch (error) {
      console.error('Error fetching profil lembaga:', error);
      toast.error('Gagal mengambil data profil lembaga.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilLembaga();
  }, [pjutdId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pjutdId) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        id_prov: selectedProvId || null,
        id_kab: selectedKabId || null,
        id_kec: selectedKecId || null,
        id_kel: formData.desa ? (desaList.find(d => d.nama.toLowerCase() === formData.desa.toLowerCase())?.id || null) : null
      };
      await axios.put(`http://127.0.0.1:8000/api/pjutd/${pjutdId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profil lembaga berhasil diperbarui!');
      setIsEditing(false);
      fetchProfilLembaga();
    } catch (error: any) {
      console.error('Error updating profil lembaga:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil lembaga.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pjutdData) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '40px' }}>
        <Building2 size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
        <p>Data Lembaga tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        .profile-stat-card {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .profile-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.15), 0 8px 10px -5px rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.3);
        }
        .profile-stat-icon {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 12px;
          border-radius: 14px;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
        }
        .profile-detail-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .profile-detail-box::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, #4f46e5, #ec4899);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .profile-detail-box:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }
        .profile-detail-box:hover::before {
          opacity: 1;
        }
        .profile-banner-bg {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pulse-avatar {
          animation: pulseShadow 2s infinite;
        }
        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
      `}</style>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Profil Lembaga</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Kelola informasi identitas dan detail alamat lembaga Anda.</p>
        </div>
        {!isEditing ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
          >
            <Edit2 size={18} /> Edit Profil
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  kode_lembaga: pjutdData.kode_lembaga || '',
                  badkom_id: pjutdData.badkom_id || '',
                  nama_pjutd: pjutdData.nama_pjutd || '',
                  nama_madrasah: pjutdData.nama_madrasah || '',
                  yayasan: pjutdData.yayasan || '',
                  no_hp: pjutdData.no_hp || '',
                  alamat: pjutdData.alamat || '',
                  provinsi: pjutdData.provinsi || '',
                  kabupaten: pjutdData.kabupaten || '',
                  kecamatan: pjutdData.kecamatan || '',
                  desa: pjutdData.desa || ''
                });
              }}
              style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
            >
              <X size={18} /> Batal
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={saving}
              style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
            >
              {saving ? 'Menyimpan...' : <><Save size={18} /> Simpan</>}
            </button>
          </div>
        )}
      </div>

      {/* Main Card with Banner */}
      <div style={{ 
        background: 'white', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.08)',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        {/* Banner Area */}
        <div className="profile-banner-bg" style={{ 
          height: '160px', 
          position: 'relative'
        }}>
          {/* Decorative Pattern overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* Profile Info Header */}
        <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '24px' }}>
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
                <Building2 size={50} strokeWidth={1.5} />
              </div>
            </div>
            
            <div style={{ paddingBottom: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                {pjutdData.nama_madrasah || pjutdData.yayasan || 'Lembaga Belum Diatur'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
                <Building2 size={16} />
                <span>Penanggung Jawab: {pjutdData.nama_pjutd}</span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 32px 0' }} />

          {!isEditing ? (
            /* View Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* System Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="profile-stat-card">
                  <div className="profile-stat-icon"><Key size={24} /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kode Lembaga</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{pjutdData.kode_lembaga}</div>
                  </div>
                </div>
                <div className="profile-stat-card">
                  <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}><Hash size={24} /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kode Wilayah Badkom</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{pjutdData.badkom?.kode_badkom || pjutdData.badkom_id}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '8px' }}>
                <div className="profile-detail-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '10px', fontWeight: 600, fontSize: '0.875rem' }}>
                    <BookOpen size={18} color="#4f46e5" /> Nama Yayasan
                  </div>
                  <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {pjutdData.yayasan || '-'}
                  </div>
                </div>
                <div className="profile-detail-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '10px', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Phone size={18} color="#ec4899" /> Nomor Handphone
                  </div>
                  <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {pjutdData.no_hp || '-'}
                  </div>
                </div>
                <div className="profile-detail-box" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '10px', fontWeight: 600, fontSize: '0.875rem' }}>
                    <MapPin size={18} color="#10b981" /> Alamat Lengkap
                  </div>
                  <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: 500 }}>
                    <div style={{ marginBottom: '6px' }}>{pjutdData.alamat || 'Alamat belum dilengkapi.'}</div>
                    {[pjutdData.desa, pjutdData.kecamatan, pjutdData.kabupaten, pjutdData.provinsi].filter(Boolean).length > 0 && (
                      <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                        {[pjutdData.desa, pjutdData.kecamatan, pjutdData.kabupaten, pjutdData.provinsi].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}><Key size={14} /> Kode Lembaga</label>
                  <input type="text" className="form-control" value={formData.kode_lembaga} disabled style={{ background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', borderColor: '#e2e8f0' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}><Hash size={14} /> Kode Wilayah Badkom</label>
                  <input type="text" className="form-control" value={pjutdData.badkom?.kode_badkom || formData.badkom_id} disabled style={{ background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', borderColor: '#e2e8f0' }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={16} /> Nama PJ UT-D</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="nama_pjutd"
                  value={formData.nama_pjutd} 
                  onChange={handleInputChange}
                  required
                  style={{ padding: '12px 16px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><School size={16} /> Nama Madrasah</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nama_madrasah"
                    value={formData.nama_madrasah} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Madrasah Diniyah Takmiliyah..."
                    style={{ padding: '12px 16px', fontSize: '1rem' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Nama Yayasan</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="yayasan"
                    value={formData.yayasan} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Yayasan Pendidikan Islam..."
                    style={{ padding: '12px 16px', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> Nomor Handphone (WhatsApp)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="no_hp"
                  value={formData.no_hp} 
                  onChange={handleInputChange}
                  placeholder="08xxxxxxxxxx"
                  style={{ padding: '12px 16px', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Alamat Lengkap</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Provinsi</label>
                    <select className="form-control" name="provinsi" value={selectedProvId} onChange={handleProvChange} required>
                      <option value="">Pilih Provinsi</option>
                      {provinsiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Kabupaten/Kota</label>
                    <select className="form-control" name="kabupaten" value={selectedKabId} onChange={handleKabChange} disabled={!selectedProvId} required>
                      <option value="">Pilih Kabupaten/Kota</option>
                      {kabupatenList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Kecamatan</label>
                    <select className="form-control" name="kecamatan" value={selectedKecId} onChange={handleKecChange} disabled={!selectedKabId} required>
                      <option value="">Pilih Kecamatan</option>
                      {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Desa</label>
                    <select className="form-control" name="desa" value={formData.desa ? (desaList.find(d => d.nama.toLowerCase() === formData.desa.toLowerCase())?.id || '') : ''} onChange={handleDesaChange} disabled={!selectedKecId} required>
                      <option value="">Pilih Desa</option>
                      {desaList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                    </select>
                  </div>
                </div>

                <textarea 
                  className="form-control" 
                  name="alamat"
                  value={formData.alamat} 
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Nama Jalan, RT/RW, Dusun..."
                  style={{ padding: '16px', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilLembagaPage;
