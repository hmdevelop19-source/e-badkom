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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <Send size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Pengajuan Kelulusan Tugas</h2>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('reguler'); setMessage(null); }}
            style={{
              flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
              color: activeTab === 'reguler' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'reguler' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Pengajuan Reguler
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('manual'); setMessage(null); }}
            style={{
              flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontWeight: 600, fontSize: '0.875rem',
              color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'manual' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            <Database size={16} /> Input Data Lama
          </button>
        </div>
        
        {message && (
          <div style={{ 
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontWeight: 500
          }}>
            <div style={{ marginTop: '2px' }}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            </div>
            <div>{message.text}</div>
          </div>
        )}

        {activeTab === 'reguler' ? (
          <form onSubmit={handleRegulerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Gunakan formulir ini untuk mengajukan kelulusan tugas (boyong) secara normal. Sistem akan memeriksa kelengkapan tugas wajib.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>NIS Santri</label>
              <input type="text" className="form-control" value={nis} onChange={(e) => setNis(e.target.value)} placeholder="Masukkan NIS" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Mondok</label>
                <input type="text" className="form-control" value={tahunMondok} onChange={(e) => setTahunMondok(e.target.value)} placeholder="Contoh: 1440/1441" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Tugas</label>
                <input type="text" className="form-control" value={tahunTugas} onChange={(e) => setTahunTugas(e.target.value)} placeholder="Contoh: 1445/1446" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Keterangan (Opsional)</label>
              <textarea className="form-control" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Tambahkan catatan jika diperlukan..." rows={3} />
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={regulerMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                <Send size={18} />
                {regulerMutation.isPending ? 'Memproses...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Form ini untuk UT-D lama. Isian disesuaikan dengan format cetak SKL agar surat kelulusan yang dicetak memiliki data yang lengkap.
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>NIS *</label>
                <input type="text" className="form-control" value={manualNis} onChange={(e) => setManualNis(e.target.value)} placeholder="Masukkan NIS Santri" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nama Lengkap *</label>
                <input type="text" className="form-control" value={manualNama} onChange={(e) => setManualNama(e.target.value)} placeholder="Masukkan Nama Lengkap" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tempat Lahir</label>
                <input type="text" className="form-control" value={manualTempatLahir} onChange={(e) => setManualTempatLahir(e.target.value)} placeholder="Contoh: Pamekasan" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tanggal Lahir</label>
                <input type="date" className="form-control" value={manualTanggalLahir} onChange={(e) => setManualTanggalLahir(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nama Wali (Ayah / Ibu)</label>
              <input type="text" className="form-control" value={manualNamaWali} onChange={(e) => setManualNamaWali(e.target.value)} placeholder="Masukkan Nama Wali" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Alamat Lengkap</label>
              <textarea className="form-control" value={manualAlamat} onChange={(e) => setManualAlamat(e.target.value)} placeholder="Contoh: Ds. Panyeppen, Kec. Palengaan, Kab. Pamekasan" rows={2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Mondok</label>
                <input type="text" className="form-control" value={manualTahunMondok} onChange={(e) => setManualTahunMondok(e.target.value)} placeholder="Contoh: 1440/1441" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tahun Tugas Akhir</label>
                <input type="text" className="form-control" value={manualTahunTugas} onChange={(e) => setManualTahunTugas(e.target.value)} placeholder="Contoh: 1445/1446" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Riwayat Tempat Tugas</label>
                <button 
                  type="button" 
                  onClick={addPjutdField}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Tambah Lembaga
                </button>
              </div>
              
              {manualPjutds.map((val, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Lembaga Tugas (PJU-TD) *</label>
                    <SearchableSelect 
                      options={pjutdOptions} 
                      value={val.pjutd_id} 
                      onChange={(v) => updatePjutdField(index, 'pjutd_id', v)} 
                      placeholder="Pilih Lembaga..." 
                      required={index === 0} 
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Thn Pendidikan *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={val.tahun_pendidikan} 
                      onChange={(e) => updatePjutdField(index, 'tahun_pendidikan', e.target.value)} 
                      placeholder="Contoh: 1445/1446" 
                      required={index === 0}
                    />
                  </div>
                  <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nilai *</label>
                    <select 
                      className="form-control" 
                      value={val.nilai} 
                      onChange={(e) => updatePjutdField(index, 'nilai', e.target.value)}
                      style={{ height: '38px' }}
                    >
                      <option value="A">A (Sangat Baik)</option>
                      <option value="B">B (Baik)</option>
                      <option value="C">C (Cukup)</option>
                      <option value="D">D (Kurang)</option>
                    </select>
                  </div>
                  {manualPjutds.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removePjutdField(index)}
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', width: '38px', height: '38px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Hapus Lembaga"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={manualMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                <Database size={18} />
                {manualMutation.isPending ? 'Memproses...' : 'Simpan Data Lama'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PengajuanBoyongPage;
