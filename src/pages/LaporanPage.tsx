import React, { useState } from 'react';
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

interface LaporanWajib {
  id: number;
  bulan_tahun: string;
  status: string;
  user: any;
  jawabans: any[];
}

interface LaporanMendesak {
  id: number;
  judul: string;
  isi_laporan: string;
  file_lampiran: string | null;
  status_penyelesaian: string;
  user: any;
  created_at: string;
}

const LaporanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'wajib' | 'mendesak'>('wajib');
  
  // Modals
  const [isSoalModalOpen, setIsSoalModalOpen] = useState(false);
  const [isSubmitWajibModalOpen, setIsSubmitWajibModalOpen] = useState(false);
  const [isMendesakModalOpen, setIsMendesakModalOpen] = useState(false);

  // Forms
  const [soalForm, setSoalForm] = useState<Partial<Soal>>({ target_level: 'utd', tipe_soal: 'uraian', opsi_jawaban: [''] });
  const [mendesakForm, setMendesakForm] = useState({ judul: '', isi_laporan: '' });
  const [jawabanForm, setJawabanForm] = useState<Record<number, string>>({});
  
  const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedBulanTahun, setSelectedBulanTahun] = useState(currentMonthYear);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level;
  const isPusat = level === 'admin' || level === 'badkom_pusat';
  const isWilayah = level === 'badkom_wilayah';
  const isSender = level === 'utd' || level === 'pjutd' || level === 'badkom_wilayah'; // Wilayah also sends to Pusat

  // Queries
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

  const updateStatusMendesakMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => api.put(`/laporan-mendesak/${data.id}/status`, { status_penyelesaian: data.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['laporan_mendesak'] })
  });

  // Handlers
  const handleSaveSoal = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...soalForm };
    if (payload.tipe_soal === 'uraian') payload.opsi_jawaban = null;
    else if (payload.opsi_jawaban) {
      payload.opsi_jawaban = payload.opsi_jawaban.filter(o => o.trim() !== '');
    }
    saveSoalMutation.mutate(payload);
  };

  const addOpsi = () => {
    if (soalForm.opsi_jawaban) {
      setSoalForm({ ...soalForm, opsi_jawaban: [...soalForm.opsi_jawaban, ''] });
    }
  };

  const updateOpsi = (index: number, value: string) => {
    if (soalForm.opsi_jawaban) {
      const newOpsi = [...soalForm.opsi_jawaban];
      newOpsi[index] = value;
      setSoalForm({ ...soalForm, opsi_jawaban: newOpsi });
    }
  };

  const handleWajibSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWajibMutation.mutate({
      bulan_tahun: selectedBulanTahun,
      jawaban: jawabanForm
    });
  };

  const handleMendesakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMendesakMutation.mutate(mendesakForm);
  };

  // Check if current user has already submitted this month
  const hasSubmittedWajib = laporanWajibList.some(l => l.user?.id === currentUser?.id && l.bulan_tahun === selectedBulanTahun);

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
                <button className="btn btn-primary" onClick={() => { setSoalForm({ target_level: 'utd', tipe_soal: 'uraian', opsi_jawaban: [''], is_active: true }); setIsSoalModalOpen(true); }}>
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
                          <button className="btn" style={{ padding: '6px' }} onClick={() => { setSoalForm(s); setIsSoalModalOpen(true); }}><Edit2 size={14} /></button>
                          <button className="btn" style={{ padding: '6px', color: 'red' }} onClick={() => deleteSoalMutation.mutate(s.id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pengumpulan / Riwayat */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Riwayat Laporan Wajib</h3>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <input 
                  type="month" 
                  className="form-control" 
                  value={selectedBulanTahun} 
                  onChange={e => setSelectedBulanTahun(e.target.value)} 
                />
                {isSender && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setJawabanForm({}); setIsSubmitWajibModalOpen(true); }}
                    disabled={hasSubmittedWajib}
                  >
                    {hasSubmittedWajib ? 'Sudah Dilaporkan' : 'Isi Laporan Bulan Ini'}
                  </button>
                )}
              </div>
            </div>

            {loadingWajib ? <p>Memuat riwayat...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {laporanWajibList.filter(l => l.bulan_tahun === selectedBulanTahun).map(laporan => (
                  <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div>
                        <strong>Pengirim: </strong> {laporan.user?.fullname} ({laporan.user?.level.toUpperCase()})
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
                {laporanWajibList.filter(l => l.bulan_tahun === selectedBulanTahun).length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>Tidak ada laporan wajib untuk periode ini.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mendesak' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Daftar Laporan Mendesak</h3>
            {isSender && (
              <button className="btn btn-primary" onClick={() => setIsMendesakModalOpen(true)}>
                <AlertCircle size={18} /> Buat Laporan Mendesak
              </button>
            )}
          </div>

          {loadingMendesak ? <p>Memuat laporan...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {laporanMendesakList.map(laporan => (
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
                    Dari: {laporan.user?.fullname} ({laporan.user?.level}) • {new Date(laporan.created_at).toLocaleString('id-ID')}
                  </div>
                  <p style={{ fontSize: '0.875rem', margin: '0 0 16px 0', whiteSpace: 'pre-wrap' }}>{laporan.isi_laporan}</p>
                  
                  {/* Status update buttons for superiors */}
                  {laporan.user?.id !== currentUser?.id && !isSender && (
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#fef3c7', color: '#b45309' }}
                        onClick={() => updateStatusMendesakMutation.mutate({ id: laporan.id, status: 'Diproses' })}
                        disabled={laporan.status_penyelesaian === 'Diproses'}
                      >
                        <Clock size={14} /> Tandai Diproses
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#dcfce7', color: '#15803d' }}
                        onClick={() => updateStatusMendesakMutation.mutate({ id: laporan.id, status: 'Selesai' })}
                        disabled={laporan.status_penyelesaian === 'Selesai'}
                      >
                        <CheckCircle size={14} /> Tandai Selesai
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah/Edit Soal */}
      <Modal isOpen={isSoalModalOpen} onClose={() => setIsSoalModalOpen(false)} title="Manajemen Soal Laporan">
        <form onSubmit={handleSaveSoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Target Pengisi Soal</label>
            <select className="form-control" value={soalForm.target_level} onChange={e => setSoalForm({...soalForm, target_level: e.target.value})}>
              <option value="utd">UTD (Santri)</option>
              <option value="pjutd">PJ UTD (Lembaga)</option>
              <option value="badkom_wilayah">Badkom Wilayah</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Pertanyaan</label>
            <textarea className="form-control" rows={3} value={soalForm.pertanyaan || ''} onChange={e => setSoalForm({...soalForm, pertanyaan: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Jawaban</label>
            <select className="form-control" value={soalForm.tipe_soal} onChange={e => setSoalForm({...soalForm, tipe_soal: e.target.value})}>
              <option value="uraian">Uraian Panjang</option>
              <option value="pilihan_ganda">Pilihan Ganda</option>
            </select>
          </div>
          {soalForm.tipe_soal === 'pilihan_ganda' && (
            <div className="form-group">
              <label className="form-label">Opsi Jawaban (Isi satu per satu)</label>
              {soalForm.opsi_jawaban?.map((opsi, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" className="form-control" value={opsi} onChange={e => updateOpsi(index, e.target.value)} placeholder={`Opsi ${index+1}`} required />
                </div>
              ))}
              <button type="button" className="btn" style={{ padding: '6px', fontSize: '0.75rem' }} onClick={addOpsi}>+ Tambah Opsi</button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn" onClick={() => setIsSoalModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Soal</button>
          </div>
        </form>
      </Modal>

      {/* Modal Isi Laporan Wajib */}
      <Modal isOpen={isSubmitWajibModalOpen} onClose={() => setIsSubmitWajibModalOpen(false)} title={`Isi Laporan Wajib - ${selectedBulanTahun}`}>
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
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <input 
                          type="radio" 
                          name={`soal_${soal.id}`} 
                          value={opsi} 
                          required 
                          onChange={e => setJawabanForm({...jawabanForm, [soal.id]: e.target.value})}
                        />
                        {opsi}
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
