import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Send, AlertCircle, CheckCircle, Database, Plus, Trash2 } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';

const PengajuanBoyongPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'reguler' | 'manual'>('reguler');

  // Reguler Form State
  const [nis, setNis] = useState('');
  const [tahunMondok, setTahunMondok] = useState('');
  const [tahunTugas, setTahunTugas] = useState('');
  const [keterangan, setKeterangan] = useState('');
  
  // Manual Form State
  const [manualNis, setManualNis] = useState('');
  const [manualNama, setManualNama] = useState('');
  const [manualTempatLahir, setManualTempatLahir] = useState('');
  const [manualTanggalLahir, setManualTanggalLahir] = useState('');
  const [manualNamaWali, setManualNamaWali] = useState('');
  const [manualAlamat, setManualAlamat] = useState('');
  
  // Array to support multiple PJU-TDs with detailed data
  const [manualPjutds, setManualPjutds] = useState<{ pjutd_id: string | number, tahun_pendidikan: string, nilai: string }[]>([
    { pjutd_id: '', tahun_pendidikan: '', nilai: 'B' }
  ]);
  
  const [manualTahunMondok, setManualTahunMondok] = useState('');
  const [manualTahunTugas, setManualTahunTugas] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { data: pjutds = [] } = useQuery({
    queryKey: ['pjutds'],
    queryFn: async () => {
      const res = await api.get('/pjutd');
      return res.data;
    }
  });

  const pjutdOptions = pjutds.map((p: any) => ({
    value: p.id,
    label: `${p.nama_pjutd} (${p.kecamatan?.nama || '-'})`
  }));

  const regulerMutation = useMutation({
    mutationFn: (data: { nis: string, tahun_mondok: string, tahun_tugas: string, keterangan: string }) => {
      return api.post('/boyong', data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      queryClient.invalidateQueries({ queryKey: ['boyong-menunggu'] });
      setMessage({ type: 'success', text: res.data.message || 'Pengajuan boyong berhasil dikirim.' });
      setNis('');
      setTahunMondok('');
      setTahunTugas('');
      setKeterangan('');
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Terjadi kesalahan saat mengajukan boyong.' });
    }
  });

  const manualMutation = useMutation({
    mutationFn: (data: { 
      nis: string, 
      nama: string, 
      tempat_lahir: string,
      tanggal_lahir: string,
      nama_wali: string,
      alamat: string,
      pjutd_data: { pjutd_id: string | number, tahun_pendidikan: string, nilai: string }[], 
      tahun_mondok: string, 
      tahun_tugas: string 
    }) => {
      return api.post('/boyong/manual', data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      queryClient.invalidateQueries({ queryKey: ['boyong'] });
      setMessage({ type: 'success', text: res.data.message || 'Data alumni manual berhasil ditambahkan dan SKL telah di-generate.' });
      setManualNis('');
      setManualNama('');
      setManualTempatLahir('');
      setManualTanggalLahir('');
      setManualNamaWali('');
      setManualAlamat('');
      setManualPjutds([{ pjutd_id: '', tahun_pendidikan: '', nilai: 'B' }]);
      setManualTahunMondok('');
      setManualTahunTugas('');
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data alumni manual.' });
    }
  });

  const handleRegulerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) {
      setMessage({ type: 'error', text: 'NIS tidak boleh kosong.' });
      return;
    }
    regulerMutation.mutate({ nis, tahun_mondok: tahunMondok, tahun_tugas: tahunTugas, keterangan });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPjutds = manualPjutds.filter(val => val.pjutd_id !== '' && val.tahun_pendidikan !== '');
    
    if (!manualNis.trim() || !manualNama.trim() || validPjutds.length === 0) {
      setMessage({ type: 'error', text: 'NIS, Nama, dan minimal satu Lembaga Tugas (beserta Tahun Pendidikan) wajib diisi.' });
      return;
    }
    manualMutation.mutate({ 
      nis: manualNis, 
      nama: manualNama, 
      tempat_lahir: manualTempatLahir,
      tanggal_lahir: manualTanggalLahir,
      nama_wali: manualNamaWali,
      alamat: manualAlamat,
      pjutd_data: validPjutds, 
      tahun_mondok: manualTahunMondok, 
      tahun_tugas: manualTahunTugas 
    });
  };

  const addPjutdField = () => {
    setManualPjutds([...manualPjutds, { pjutd_id: '', tahun_pendidikan: '', nilai: 'B' }]);
  };

  const removePjutdField = (index: number) => {
    if (manualPjutds.length > 1) {
      const newPjutds = [...manualPjutds];
      newPjutds.splice(index, 1);
      setManualPjutds(newPjutds);
    }
  };

  const updatePjutdField = (index: number, field: string, value: string | number) => {
    const newPjutds = [...manualPjutds];
    newPjutds[index] = { ...newPjutds[index], [field]: value };
    setManualPjutds(newPjutds);
  };

  return (
    <>
      <style>{`
        .boyong-tab-btn {
          padding: 12px 24px;
          border-radius: 14px;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: #64748b;
          white-space: nowrap;
        }
        .boyong-tab-btn:hover:not(.active) {
          background: rgba(226, 232, 240, 0.5);
          color: #334155;
        }
        .boyong-tab-btn.active.reguler {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        }
        .boyong-tab-btn.active.manual {
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }
        .boyong-card-header {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
          overflow: hidden;
        }
        .boyong-card-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #4f46e5, #ec4899);
          opacity: 0.8;
          transition: all 0.5s ease;
        }
        .boyong-card-header.manual-mode::before {
          background: linear-gradient(90deg, #0ea5e9, #2563eb);
        }
        .form-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pjutd-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
        }
        .pjutd-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .boyong-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .styled-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.95rem;
          color: #334155;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .styled-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
          background: #f8fafc;
        }
        .styled-input::placeholder {
          color: #94a3b8;
        }
        .manual-mode .styled-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }

        @media (max-width: 768px) {
          .boyong-grid {
            grid-template-columns: 1fr;
          }
          .boyong-card-header {
            padding: 24px 20px;
          }
        }
      `}</style>
      
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Title & Segmented Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)', color: 'var(--primary)', marginBottom: '16px' }}>
              <Send size={32} strokeWidth={1.5} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Pengajuan Kelulusan Tugas</h2>
            <p style={{ margin: 0, color: '#64748b', maxWidth: '500px', lineHeight: 1.5 }}>
              Proses administrasi kelulusan tugas akhir (Boyong) untuk UT-D aktif atau input data arsip bagi UT-D lama.
            </p>
          </div>

          <div style={{ display: 'flex', background: '#f8fafc', padding: '8px', borderRadius: '18px', gap: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <button 
              className={`boyong-tab-btn ${activeTab === 'reguler' ? 'active reguler' : ''}`}
              onClick={() => { setActiveTab('reguler'); setMessage(null); }}
            >
              <Send size={18} /> Pengajuan Reguler
            </button>
            <button 
              className={`boyong-tab-btn ${activeTab === 'manual' ? 'active manual' : ''}`}
              onClick={() => { setActiveTab('manual'); setMessage(null); }}
            >
              <Database size={18} /> Input Data Lama
            </button>
          </div>
        </div>

        <div className={`boyong-card-header ${activeTab === 'manual' ? 'manual-mode' : ''}`}>
          
          {message && (
            <div style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '16px 20px', 
              borderRadius: '12px', 
              marginBottom: '32px',
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontWeight: 500,
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginTop: '2px' }}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              <div style={{ lineHeight: 1.5 }}>{message.text}</div>
            </div>
          )}

          {activeTab === 'reguler' ? (
            <form onSubmit={handleRegulerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Panduan:</strong> Gunakan formulir ini untuk mengajukan kelulusan tugas (boyong) secara normal. Sistem akan memeriksa kelengkapan kewajiban tugas dan laporan secara otomatis sebelum menyetujui pengajuan.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>NIS Santri *</label>
                <input type="text" className="styled-input" value={nis} onChange={(e) => setNis(e.target.value)} placeholder="Masukkan NIS Santri yang akan diajukan..." required style={{ width: '100%', maxWidth: '400px' }} />
              </div>

              <div className="boyong-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Mondok</label>
                  <input type="text" className="styled-input" value={tahunMondok} onChange={(e) => setTahunMondok(e.target.value)} placeholder="Contoh: 1440/1441" style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Tugas Akhir</label>
                  <input type="text" className="styled-input" value={tahunTugas} onChange={(e) => setTahunTugas(e.target.value)} placeholder="Contoh: 1445/1446" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Keterangan Tambahan (Opsional)</label>
                <textarea className="styled-input" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Tambahkan catatan khusus jika diperlukan..." rows={4} style={{ width: '100%', resize: 'vertical' }} />
              </div>

              <div style={{ marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={regulerMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
                  <Send size={18} />
                  {regulerMutation.isPending ? 'Memproses Pengajuan...' : 'Kirim Pengajuan Boyong'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: '#f0f9ff', padding: '16px 20px', borderRadius: '12px', border: '1px dashed #bae6fd', color: '#0369a1', fontSize: '0.9rem', lineHeight: 1.5 }}>
                <strong>Data Historis:</strong> Form ini dikhususkan untuk menginput data UT-D lama (Alumni) yang belum masuk sistem. Isian disesuaikan dengan format cetak SKL agar surat kelulusan yang dihasilkan memiliki data historis yang lengkap dan akurat.
              </div>
              
              <div>
                <div className="form-section-title">Data Diri Santri</div>
                <div className="boyong-grid" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>NIS *</label>
                    <input type="text" className="styled-input" value={manualNis} onChange={(e) => setManualNis(e.target.value)} placeholder="Masukkan NIS" required style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nama Lengkap *</label>
                    <input type="text" className="styled-input" value={manualNama} onChange={(e) => setManualNama(e.target.value)} placeholder="Masukkan Nama Lengkap" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="boyong-grid" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tempat Lahir</label>
                    <input type="text" className="styled-input" value={manualTempatLahir} onChange={(e) => setManualTempatLahir(e.target.value)} placeholder="Kota Kelahiran" style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tanggal Lahir</label>
                    <input type="date" className="styled-input" value={manualTanggalLahir} onChange={(e) => setManualTanggalLahir(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nama Wali (Ayah / Ibu)</label>
                  <input type="text" className="styled-input" value={manualNamaWali} onChange={(e) => setManualNamaWali(e.target.value)} placeholder="Nama lengkap wali" style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Alamat Lengkap</label>
                  <textarea className="styled-input" value={manualAlamat} onChange={(e) => setManualAlamat(e.target.value)} placeholder="Ds. Panyeppen, Kec. Palengaan, Kab. Pamekasan" rows={3} style={{ width: '100%', resize: 'vertical' }} />
                </div>
              </div>

              <div>
                <div className="form-section-title">Data Pendidikan & Penugasan</div>
                <div className="boyong-grid" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Mondok</label>
                    <input type="text" className="styled-input" value={manualTahunMondok} onChange={(e) => setManualTahunMondok(e.target.value)} placeholder="Contoh: 1440/1441" style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Tugas Akhir</label>
                    <input type="text" className="styled-input" value={manualTahunTugas} onChange={(e) => setManualTahunTugas(e.target.value)} placeholder="Contoh: 1445/1446" style={{ width: '100%' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Riwayat Tempat Tugas</label>
                    <button 
                      type="button" 
                      onClick={addPjutdField}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <Plus size={16} /> Tambah Lembaga
                    </button>
                  </div>
                  
                  {manualPjutds.map((val, index) => (
                    <div key={index} className="pjutd-card">
                      {manualPjutds.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removePjutdField(index)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: '#fef2f2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="Hapus Lembaga"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="boyong-grid" style={{ gap: '16px', paddingRight: manualPjutds.length > 1 ? '40px' : '0' }}>
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Lembaga Tugas (PJU-TD) *</label>
                          <SearchableSelect 
                            options={pjutdOptions} 
                            value={val.pjutd_id} 
                            onChange={(v) => updatePjutdField(index, 'pjutd_id', v)} 
                            placeholder="Ketik untuk mencari lembaga..." 
                            required={index === 0} 
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Thn Pendidikan *</label>
                            <input 
                              type="text" 
                              className="styled-input" 
                              value={val.tahun_pendidikan} 
                              onChange={(e) => updatePjutdField(index, 'tahun_pendidikan', e.target.value)} 
                              placeholder="1445/1446" 
                              required={index === 0}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nilai *</label>
                            <select 
                              className="styled-input" 
                              value={val.nilai} 
                              onChange={(e) => updatePjutdField(index, 'nilai', e.target.value)}
                              style={{ width: '100%', background: 'white' }}
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={manualMutation.isPending} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)' }}>
                  <Database size={18} />
                  {manualMutation.isPending ? 'Menyimpan...' : 'Simpan Data Alumni (Manual)'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default PengajuanBoyongPage;
