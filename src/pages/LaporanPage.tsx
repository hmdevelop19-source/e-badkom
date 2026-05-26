import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { FileText, AlertCircle, Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import Modal from '../components/Modal';

interface Soal {
  id: number;
  target_level: string;
  pertanyaan: string;
  tipe_soal: string;
  opsi_jawaban: string[] | null;
  is_active: boolean;
}

interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
}

interface LaporanWajib {
  id: number;
  bulan_tahun: string;
  kategori_bulan: string;
  tahun_ajaran_id: number;
  status: string;
  user: any;
  jawabans: any[];
  tahunAjaran?: TahunAjaran;
}

interface LaporanMendesak {
  id: number;
  judul: string;
  isi_laporan: string;
  file_lampiran: string | null;
  status_penyelesaian: string;
  tahun_ajaran_id: number;
  user: any;
  created_at: string;
  tahunAjaran?: TahunAjaran;
}

const KATEGORI_BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => `Bulan Ke-${i + 1}`);

const LaporanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'wajib' | 'mendesak'>('wajib');
  
  // Modals
  const [isSoalModalOpen, setIsSoalModalOpen] = useState(false);
  const [isSubmitWajibModalOpen, setIsSubmitWajibModalOpen] = useState(false);
  const [isMendesakModalOpen, setIsMendesakModalOpen] = useState(false);

  // Forms
  const [soalForms, setSoalForms] = useState<Partial<Soal>[]>([{ tipe_soal: 'uraian', opsi_jawaban: [''] }]);
  const [globalTargetLevel, setGlobalTargetLevel] = useState('utd');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [mendesakForm, setMendesakForm] = useState({ judul: '', isi_laporan: '' });
  const [jawabanForm, setJawabanForm] = useState<Record<number, string>>({});
  
  const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedKategoriBulan, setSelectedKategoriBulan] = useState('Bulan Ke-1');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | ''>('');

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level;
  const isPusat = level === 'admin' || level === 'badkom_pusat';
  const isSender = level === 'utd' || level === 'pjutd' || level === 'badkom_wilayah';

  // Queries
  const { data: tahunAjaranList = [] } = useQuery<TahunAjaran[]>({
    queryKey: ['tahun_ajaran'],
    queryFn: async () => {
      const res = await api.get('/tahun-ajaran');
      return res.data;
    }
  });

  useEffect(() => {
    if (tahunAjaranList.length > 0 && selectedTahunAjaran === '') {
      const active = tahunAjaranList.find(t => t.is_active);
      if (active) setSelectedTahunAjaran(active.id);
      else setSelectedTahunAjaran(tahunAjaranList[0].id);
    }
  }, [tahunAjaranList, selectedTahunAjaran]);

  const { data: soalList = [], isLoading: loadingSoal } = useQuery<Soal[]>({
    queryKey: ['soal_laporan'],
    queryFn: async () => {
      const res = await api.get('/soal-laporan');
      return res.data;
    },
    enabled: isPusat
  });

  const { data: mySoal = [], isLoading: loadingMySoal } = useQuery<Soal[]>({
    queryKey: ['my_soal_laporan'],
    queryFn: async () => {
      const res = await api.get('/laporan-wajib/soal');
      return res.data;
    },
    enabled: isSender
  });

  const { data: laporanWajibList = [], isLoading: loadingWajib } = useQuery<LaporanWajib[]>({
    queryKey: ['laporan_wajib'],
    queryFn: async () => {
      const res = await api.get('/laporan-wajib');
      return res.data;
    }
  });

  const { data: laporanMendesakList = [], isLoading: loadingMendesak } = useQuery<LaporanMendesak[]>({
    queryKey: ['laporan_mendesak'],
    queryFn: async () => {
      const res = await api.get('/laporan-mendesak');
      return res.data;
    }
  });

  // Mutations
  const saveSoalMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.isBatch) return api.post('/soal-laporan', { soal_list: data.items });
      if (data.id) return api.put(`/soal-laporan/${data.id}`, data);
      return api.post('/soal-laporan', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soal_laporan'] });
      setIsSoalModalOpen(false);
    }
  });

  const deleteSoalMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/soal-laporan/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soal_laporan'] })
  });

  const submitWajibMutation = useMutation({
    mutationFn: (data: any) => api.post('/laporan-wajib/submit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan_wajib'] });
      setIsSubmitWajibModalOpen(false);
    }
  });

  const submitMendesakMutation = useMutation({
    mutationFn: (data: any) => api.post('/laporan-mendesak', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan_mendesak'] });
      setIsMendesakModalOpen(false);
    }
  });

  // Handlers
  const handleSaveSoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      const payload = { ...soalForms[0], target_level: globalTargetLevel };
      if (payload.tipe_soal === 'uraian') payload.opsi_jawaban = null;
      else if (payload.opsi_jawaban) {
        payload.opsi_jawaban = payload.opsi_jawaban.filter(o => o.trim() !== '');
      }
      saveSoalMutation.mutate(payload);
    } else {
      const items = soalForms.map(form => {
        const payload = { ...form, target_level: globalTargetLevel };
        if (payload.tipe_soal === 'uraian') payload.opsi_jawaban = null;
        else if (payload.opsi_jawaban) {
          payload.opsi_jawaban = payload.opsi_jawaban.filter(o => o.trim() !== '');
        }
        return payload;
      });
      saveSoalMutation.mutate({ isBatch: true, items });
    }
  };

  const addSoalForm = () => {
    setSoalForms([...soalForms, { tipe_soal: 'uraian', opsi_jawaban: [''] }]);
  };

  const removeSoalForm = (index: number) => {
    if (soalForms.length > 1) {
      setSoalForms(soalForms.filter((_, i) => i !== index));
    }
  };

  const updateSoalForm = (index: number, field: keyof Soal, value: any) => {
    const newForms = [...soalForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setSoalForms(newForms);
  };

  const addOpsi = (formIndex: number) => {
    const form = soalForms[formIndex];
    if (form.opsi_jawaban) {
      updateSoalForm(formIndex, 'opsi_jawaban', [...form.opsi_jawaban, '']);
    }
  };

  const updateOpsi = (formIndex: number, opsiIndex: number, value: string) => {
    const form = soalForms[formIndex];
    if (form.opsi_jawaban) {
      const newOpsi = [...form.opsi_jawaban];
      newOpsi[opsiIndex] = value;
      updateSoalForm(formIndex, 'opsi_jawaban', newOpsi);
    }
  };

  const removeOpsi = (formIndex: number, opsiIndex: number) => {
    const form = soalForms[formIndex];
    if (form.opsi_jawaban && form.opsi_jawaban.length > 1) {
      const newOpsi = form.opsi_jawaban.filter((_, i) => i !== opsiIndex);
      updateSoalForm(formIndex, 'opsi_jawaban', newOpsi);
    }
  };

  const handleWajibSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWajibMutation.mutate({
      bulan_tahun: currentMonthYear,
      kategori_bulan: selectedKategoriBulan,
      jawaban: jawabanForm
    });
  };

  const handleMendesakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMendesakMutation.mutate(mendesakForm);
  };

  // Check if current user has already submitted this month IN THE ACTIVE TAHUN AJARAN
  const activeTahunAjaran = tahunAjaranList.find(t => t.is_active);
  const hasSubmittedWajib = laporanWajibList.some(l => 
    l.user?.id === currentUser?.id && 
    l.kategori_bulan === selectedKategoriBulan && 
    l.tahun_ajaran_id === activeTahunAjaran?.id
  );

  // My Reports only, filtered by selectedTahunAjaran
  const myLaporanWajibList = laporanWajibList.filter(l => l.user?.id === currentUser?.id && l.tahun_ajaran_id === selectedTahunAjaran);
  const myLaporanMendesakList = laporanMendesakList.filter(l => l.user?.id === currentUser?.id && l.tahun_ajaran_id === selectedTahunAjaran);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <button 
          className="btn" 
          style={{ background: activeTab === 'wajib' ? 'var(--primary-color)' : '#f1f5f9', color: activeTab === 'wajib' ? 'white' : '#475569' }}
          onClick={() => setActiveTab('wajib')}
        >
          <FileText size={18} /> Laporan Wajib (Rutin)
        </button>
        <button 
          className="btn" 
          style={{ background: activeTab === 'mendesak' ? 'var(--primary-color)' : '#f1f5f9', color: activeTab === 'mendesak' ? 'white' : '#475569' }}
          onClick={() => setActiveTab('mendesak')}
        >
          <AlertCircle size={18} /> Laporan Mendesak
        </button>
      </div>

      {activeTab === 'wajib' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Admin Soal Management */}
          {isPusat && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Bank Soal Laporan</h3>
                <button className="btn btn-primary" onClick={() => { 
                  setIsEditMode(false); 
                  setGlobalTargetLevel('utd');
                  setSoalForms([{ tipe_soal: 'uraian', opsi_jawaban: [''], is_active: true }]); 
                  setIsSoalModalOpen(true); 
                }}>
                  <Plus size={18} /> Tambah Soal
                </button>
              </div>
              
              {loadingSoal ? <p>Memuat soal...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '12px' }}>Target</th>
                      <th style={{ padding: '12px' }}>Pertanyaan</th>
                      <th style={{ padding: '12px' }}>Tipe</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soalList.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca' }}>
                            {s.target_level.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{s.pertanyaan}</td>
                        <td style={{ padding: '12px' }}>{s.tipe_soal === 'uraian' ? 'Uraian' : 'Pilihan Ganda'}</td>
                        <td style={{ padding: '12px' }}>{s.is_active ? 'Aktif' : 'Nonaktif'}</td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                          <button className="btn" style={{ padding: '6px' }} onClick={() => { 
                            setIsEditMode(true); 
                            setGlobalTargetLevel(s.target_level);
                            setSoalForms([{ ...s }]); 
                            setIsSoalModalOpen(true); 
                          }}><Edit2 size={14} /></button>
                          <button className="btn" style={{ padding: '6px', color: 'red' }} onClick={() => deleteSoalMutation.mutate(s.id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pengumpulan / Riwayat Saya */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <h3 style={{ margin: 0 }}>Laporan Wajib Saya</h3>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>T.A:</span>
                  <select 
                    className="form-control" 
                    value={selectedTahunAjaran} 
                    onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                    style={{ padding: '6px 12px' }}
                  >
                    {tahunAjaranList.map(ta => (
                      <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                    ))}
                  </select>
                </div>
                <select 
                  className="form-control" 
                  value={selectedKategoriBulan} 
                  onChange={e => setSelectedKategoriBulan(e.target.value)}
                  style={{ padding: '6px 12px' }}
                >
                  {KATEGORI_BULAN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {isSender && selectedTahunAjaran === activeTahunAjaran?.id && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setJawabanForm({}); setIsSubmitWajibModalOpen(true); }}
                    disabled={hasSubmittedWajib}
                    style={{ padding: '6px 16px' }}
                  >
                    {hasSubmittedWajib ? 'Sudah Dilaporkan' : 'Isi Laporan Ini'}
                  </button>
                )}
              </div>
            </div>

            {loadingWajib ? <p>Memuat riwayat...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myLaporanWajibList.filter(l => l.kategori_bulan === selectedKategoriBulan).map(laporan => (
                  <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div>
                        <strong>{laporan.kategori_bulan}</strong> 
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem', marginLeft: '8px' }}>(Dikirim: {laporan.bulan_tahun})</span>
                      </div>
                      <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                        <CheckCircle size={14} /> Terkirim
                      </span>
                    </div>
                    <div>
                      {laporan.jawabans.map((j: any) => (
                        <div key={j.id} style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Q: {j.soal_laporan?.pertanyaan}</div>
                          <div>A: {j.jawaban}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {myLaporanWajibList.filter(l => l.kategori_bulan === selectedKategoriBulan).length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>Anda belum mengisi laporan untuk {selectedKategoriBulan} pada Tahun Ajaran ini.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mendesak' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0 }}>Laporan Mendesak Saya</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Tahun Ajaran:</span>
              <select 
                className="form-control" 
                value={selectedTahunAjaran} 
                onChange={e => setSelectedTahunAjaran(Number(e.target.value))}
                style={{ padding: '6px 12px' }}
              >
                {tahunAjaranList.map(ta => (
                  <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : ''}</option>
                ))}
              </select>
              {isSender && selectedTahunAjaran === activeTahunAjaran?.id && (
                <button className="btn btn-primary" onClick={() => setIsMendesakModalOpen(true)}>
                  <AlertCircle size={18} /> Buat Laporan Mendesak
                </button>
              )}
            </div>
          </div>

          {loadingMendesak ? <p>Memuat laporan...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myLaporanMendesakList.map(laporan => (
                <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: laporan.status_penyelesaian === 'Selesai' ? '#f8fafc' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{laporan.judul}</h4>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '16px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: laporan.status_penyelesaian === 'Menunggu' ? '#fee2e2' : laporan.status_penyelesaian === 'Diproses' ? '#fef3c7' : '#dcfce7',
                      color: laporan.status_penyelesaian === 'Menunggu' ? '#b91c1c' : laporan.status_penyelesaian === 'Diproses' ? '#b45309' : '#15803d',
                    }}>
                      {laporan.status_penyelesaian}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px' }}>
                    Dikirim: {new Date(laporan.created_at).toLocaleString('id-ID')}
                  </div>
                  <p style={{ fontSize: '0.875rem', margin: '0 0 16px 0', whiteSpace: 'pre-wrap' }}>{laporan.isi_laporan}</p>
                </div>
              ))}
              {myLaporanMendesakList.length === 0 && (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>Anda belum membuat laporan mendesak pada Tahun Ajaran ini.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah/Edit Soal */}
      <Modal isOpen={isSoalModalOpen} onClose={() => setIsSoalModalOpen(false)} title={isEditMode ? "Edit Soal" : "Tambah Soal (Bisa Sekaligus Banyak)"}>
        <form onSubmit={handleSaveSoal} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ fontWeight: 'bold' }}>Target Pengisi Soal {isEditMode ? '' : '(Berlaku untuk semua soal di bawah)'}</label>
            <select className="form-control" value={globalTargetLevel} onChange={e => setGlobalTargetLevel(e.target.value)}>
              <option value="utd">UTD (Santri)</option>
              <option value="pjutd">PJ UTD (Lembaga)</option>
              <option value="badkom_wilayah">Badkom Wilayah</option>
            </select>
          </div>

          {soalForms.map((form, formIndex) => (
            <div key={formIndex} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', position: 'relative', background: '#fff' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--primary-color)' }}>Soal {formIndex + 1}</div>
              
              {!isEditMode && soalForms.length > 1 && (
                <button type="button" onClick={() => removeSoalForm(formIndex)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={16} />
                </button>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Pertanyaan</label>
                  <textarea className="form-control" rows={2} value={form.pertanyaan || ''} onChange={e => updateSoalForm(formIndex, 'pertanyaan', e.target.value)} required placeholder="Tuliskan pertanyaan di sini..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipe Jawaban</label>
                  <select className="form-control" value={form.tipe_soal} onChange={e => updateSoalForm(formIndex, 'tipe_soal', e.target.value)}>
                    <option value="uraian">Uraian Panjang</option>
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                  </select>
                </div>
                {form.tipe_soal === 'pilihan_ganda' && (
                  <div className="form-group">
                    <label className="form-label">Opsi Jawaban</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {form.opsi_jawaban?.map((opsi, opsiIndex) => (
                        <div key={opsiIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#94a3b8', width: '24px' }}>{String.fromCharCode(65 + opsiIndex)}.</span>
                          <input type="text" className="form-control" value={opsi} onChange={e => updateOpsi(formIndex, opsiIndex, e.target.value)} placeholder={`Opsi ${opsiIndex+1}`} required style={{ flex: 1 }} />
                          {form.opsi_jawaban!.length > 1 && (
                            <button type="button" onClick={() => removeOpsi(formIndex, opsiIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '8px', alignSelf: 'flex-start', background: '#f1f5f9' }} onClick={() => addOpsi(formIndex)}>+ Tambah Opsi</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!isEditMode && (
            <button type="button" className="btn" style={{ alignSelf: 'flex-start', border: '1px dashed #cbd5e1', color: 'var(--primary-color)' }} onClick={addSoalForm}>
              <Plus size={16} /> Tambah Pertanyaan Lain
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button type="button" className="btn" onClick={() => setIsSoalModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan {soalForms.length > 1 ? 'Semua Soal' : 'Soal'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Isi Laporan Wajib */}
      <Modal isOpen={isSubmitWajibModalOpen} onClose={() => setIsSubmitWajibModalOpen(false)} title={`Isi Laporan Wajib - ${selectedKategoriBulan}`}>
        <form onSubmit={handleWajibSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loadingMySoal ? <p>Memuat pertanyaan...</p> : mySoal.length === 0 ? <p>Belum ada soal aktif untuk level Anda.</p> : (
            mySoal.map(soal => (
              <div key={soal.id} className="form-group">
                <label className="form-label">{soal.pertanyaan}</label>
                {soal.tipe_soal === 'uraian' ? (
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    required 
                    onChange={e => setJawabanForm({...jawabanForm, [soal.id]: e.target.value})}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {soal.opsi_jawaban?.map((opsi, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.875rem', cursor: 'pointer', margin: 0 }}>
                        <input 
                          type="radio" 
                          name={`soal_${soal.id}`} 
                          value={opsi} 
                          required 
                          onChange={e => setJawabanForm({...jawabanForm, [soal.id]: e.target.value})}
                          style={{ width: 'auto', marginTop: '4px', flexShrink: 0 }}
                        />
                        <span style={{ lineHeight: '1.5' }}>{opsi}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn" onClick={() => setIsSubmitWajibModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={mySoal.length === 0 || submitWajibMutation.isPending}>Kirim Laporan</button>
          </div>
        </form>
      </Modal>

      {/* Modal Isi Laporan Mendesak */}
      <Modal isOpen={isMendesakModalOpen} onClose={() => setIsMendesakModalOpen(false)} title="Buat Laporan Mendesak">
        <form onSubmit={handleMendesakSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Judul Masalah / Laporan</label>
            <input 
              type="text" 
              className="form-control" 
              value={mendesakForm.judul}
              onChange={e => setMendesakForm({...mendesakForm, judul: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi Lengkap</label>
            <textarea 
              className="form-control" 
              rows={5} 
              value={mendesakForm.isi_laporan}
              onChange={e => setMendesakForm({...mendesakForm, isi_laporan: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn" onClick={() => setIsMendesakModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitMendesakMutation.isPending}>Kirim Laporan</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default LaporanPage;
