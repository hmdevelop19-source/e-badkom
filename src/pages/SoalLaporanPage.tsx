import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Plus, Edit2, Trash2, Settings, List, MoveDown, MoveUp } from 'lucide-react';
import Modal from '../components/Modal';

interface KategoriSoal {
  id: number;
  nama_kategori: string;
  target_level: string;
  urutan: number;
  soal_laporan?: Soal[];
}

interface Soal {
  id: number;
  target_level: string;
  kategori_soal_id: number | null;
  pertanyaan: string;
  tipe_soal: string;
  opsi_jawaban: any[] | null;
  is_active: boolean;
  urutan: number;
}

const SoalLaporanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSoalTab, setActiveSoalTab] = useState<'utd' | 'pjutd'>('utd');
  
  // Modals
  const [isSoalModalOpen, setIsSoalModalOpen] = useState(false);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);

  // Forms Kategori
  const [kategoriForm, setKategoriForm] = useState<Partial<KategoriSoal>>({});
  const [isEditKategoriMode, setIsEditKategoriMode] = useState(false);

  // Forms Soal
  const [soalForms, setSoalForms] = useState<Partial<Soal>[]>([{ tipe_soal: 'uraian', opsi_jawaban: [''] }]);
  const [globalTargetLevel, setGlobalTargetLevel] = useState('utd');
  const [selectedKategoriId, setSelectedKategoriId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Queries
  const { data: kategoriList = [], isLoading: loadingKategori } = useQuery<KategoriSoal[]>({
    queryKey: ['kategori_soal', activeSoalTab],
    queryFn: async () => {
      const res = await api.get(`/kategori-soal?target_level=${activeSoalTab}`);
      return res.data;
    }
  });

  // Kategori Mutations
  const saveKategoriMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return api.put(`/kategori-soal/${data.id}`, data);
      return api.post('/kategori-soal', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategori_soal'] });
      setIsKategoriModalOpen(false);
    }
  });

  const deleteKategoriMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/kategori-soal/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kategori_soal'] })
  });

  const reorderKategoriMutation = useMutation({
    mutationFn: (ordered_ids: number[]) => api.post('/kategori-soal/reorder', { ordered_ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kategori_soal'] })
  });

  // Soal Mutations
  const saveSoalMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.isBatch) return api.post('/soal-laporan', { soal_list: data.items });
      if (data.id) return api.put(`/soal-laporan/${data.id}`, data);
      return api.post('/soal-laporan', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategori_soal'] });
      setIsSoalModalOpen(false);
    }
  });

  const deleteSoalMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/soal-laporan/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kategori_soal'] })
  });

  // Handlers Kategori
  const handleSaveKategori = (e: React.FormEvent) => {
    e.preventDefault();
    saveKategoriMutation.mutate({ ...kategoriForm, target_level: activeSoalTab });
  };

  const moveKategori = (index: number, direction: 'up' | 'down') => {
    const newKategori = [...kategoriList];
    if (direction === 'up' && index > 0) {
      [newKategori[index], newKategori[index - 1]] = [newKategori[index - 1], newKategori[index]];
    } else if (direction === 'down' && index < newKategori.length - 1) {
      [newKategori[index], newKategori[index + 1]] = [newKategori[index + 1], newKategori[index]];
    }
    reorderKategoriMutation.mutate(newKategori.map(k => k.id));
  };

  // Handlers Soal
  const handleSaveSoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      const payload = { ...soalForms[0], target_level: globalTargetLevel, kategori_soal_id: selectedKategoriId };
      if (payload.tipe_soal === 'uraian') payload.opsi_jawaban = null;
      else if ((payload.tipe_soal === 'pilihan_ganda' || payload.tipe_soal === 'uraian_multi') && payload.opsi_jawaban) {
        payload.opsi_jawaban = payload.opsi_jawaban.filter((o: any) => typeof o === 'string' && o.trim() !== '');
      } else if (payload.tipe_soal === 'pilihan_ganda_multi' && payload.opsi_jawaban) {
        payload.opsi_jawaban = payload.opsi_jawaban.filter((g: any) => g && typeof g === 'object' && g.label.trim() !== '').map((g: any) => ({
          ...g,
          options: g.options.filter((opt: string) => typeof opt === 'string' && opt.trim() !== '')
        }));
      }
      saveSoalMutation.mutate(payload);
    } else {
      const items = soalForms.map(form => {
        const payload = { ...form, target_level: globalTargetLevel, kategori_soal_id: selectedKategoriId };
        if (payload.tipe_soal === 'uraian') payload.opsi_jawaban = null;
        else if ((payload.tipe_soal === 'pilihan_ganda' || payload.tipe_soal === 'uraian_multi') && payload.opsi_jawaban) {
          payload.opsi_jawaban = payload.opsi_jawaban.filter((o: any) => typeof o === 'string' && o.trim() !== '');
        } else if (payload.tipe_soal === 'pilihan_ganda_multi' && payload.opsi_jawaban) {
          payload.opsi_jawaban = payload.opsi_jawaban.filter((g: any) => g && typeof g === 'object' && g.label.trim() !== '').map((g: any) => ({
            ...g,
            options: g.options.filter((opt: string) => typeof opt === 'string' && opt.trim() !== '')
          }));
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
    if ((form.tipe_soal === 'pilihan_ganda' || form.tipe_soal === 'uraian_multi') && form.opsi_jawaban) {
      updateSoalForm(formIndex, 'opsi_jawaban', [...form.opsi_jawaban, '']);
    }
  };

  const updateOpsi = (formIndex: number, opsiIndex: number, value: string) => {
    const form = soalForms[formIndex];
    if ((form.tipe_soal === 'pilihan_ganda' || form.tipe_soal === 'uraian_multi') && form.opsi_jawaban) {
      const newOpsi = [...form.opsi_jawaban];
      newOpsi[opsiIndex] = value;
      updateSoalForm(formIndex, 'opsi_jawaban', newOpsi);
    }
  };

  const removeOpsi = (formIndex: number, opsiIndex: number) => {
    const form = soalForms[formIndex];
    if ((form.tipe_soal === 'pilihan_ganda' || form.tipe_soal === 'uraian_multi') && form.opsi_jawaban && form.opsi_jawaban.length > 1) {
      const newOpsi = form.opsi_jawaban.filter((_, i) => i !== opsiIndex);
      updateSoalForm(formIndex, 'opsi_jawaban', newOpsi);
    }
  };

  // Handlers for Multi
  const addMultiGroup = (formIndex: number) => {
    const form = soalForms[formIndex];
    const currentOpsi = Array.isArray(form.opsi_jawaban) ? form.opsi_jawaban : [];
    updateSoalForm(formIndex, 'opsi_jawaban', [...currentOpsi, { label: '', options: [''] }]);
  };

  const updateMultiGroupLabel = (formIndex: number, groupIndex: number, value: string) => {
    const form = soalForms[formIndex];
    const currentOpsi = Array.isArray(form.opsi_jawaban) ? [...form.opsi_jawaban] : [];
    if (currentOpsi[groupIndex]) {
      currentOpsi[groupIndex] = { ...currentOpsi[groupIndex], label: value };
      updateSoalForm(formIndex, 'opsi_jawaban', currentOpsi);
    }
  };

  const removeMultiGroup = (formIndex: number, groupIndex: number) => {
    const form = soalForms[formIndex];
    const currentOpsi = Array.isArray(form.opsi_jawaban) ? form.opsi_jawaban : [];
    if (currentOpsi.length > 1) {
      updateSoalForm(formIndex, 'opsi_jawaban', currentOpsi.filter((_, i) => i !== groupIndex));
    }
  };

  const addMultiOpsi = (formIndex: number, groupIndex: number) => {
    const form = soalForms[formIndex];
    const currentOpsi = Array.isArray(form.opsi_jawaban) ? [...form.opsi_jawaban] : [];
    if (currentOpsi[groupIndex]) {
      currentOpsi[groupIndex] = { ...currentOpsi[groupIndex], options: [...currentOpsi[groupIndex].options, ''] };
      updateSoalForm(formIndex, 'opsi_jawaban', currentOpsi);
    }
  };

  const updateMultiOpsi = (formIndex: number, groupIndex: number, opsiIndex: number, value: string) => {
    const form = soalForms[formIndex];
    const currentOpsi = Array.isArray(form.opsi_jawaban) ? [...form.opsi_jawaban] : [];
    if (currentOpsi[groupIndex]) {
      const newOptions = [...currentOpsi[groupIndex].options];
      newOptions[opsiIndex] = value;
      currentOpsi[groupIndex] = { ...currentOpsi[groupIndex], options: newOptions };
      updateSoalForm(formIndex, 'opsi_jawaban', currentOpsi);
    }
  };

  const removeMultiOpsi = (formIndex: number, groupIndex: number, opsiIndex: number) => {
    const form = soalForms[formIndex];
    const currentOpsi = Array.isArray(form.opsi_jawaban) ? [...form.opsi_jawaban] : [];
    if (currentOpsi[groupIndex] && currentOpsi[groupIndex].options.length > 1) {
      const newOptions = currentOpsi[groupIndex].options.filter((_: any, i: number) => i !== opsiIndex);
      currentOpsi[groupIndex] = { ...currentOpsi[groupIndex], options: newOptions };
      updateSoalForm(formIndex, 'opsi_jawaban', currentOpsi);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={24} style={{ color: 'var(--primary)' }} />
            <h2 className="m-0">Form Builder (Bank Soal Dinamis)</h2>
          </div>
          <button className="btn btn-outline" onClick={() => { 
            setIsEditKategoriMode(false);
            setKategoriForm({ nama_kategori: '' });
            setIsKategoriModalOpen(true);
          }}>
            <List size={18} /> Tambah Kategori
          </button>
        </div>

        {/* Sub-tabs for Target Level */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
          <button 
            style={{ padding: '8px 16px', border: 'none', background: activeSoalTab === 'utd' ? '#e0e7ff' : 'transparent', color: activeSoalTab === 'utd' ? '#4338ca' : '#64748b', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setActiveSoalTab('utd')}
          >Laporan UT-D (Santri)</button>
          <button 
            style={{ padding: '8px 16px', border: 'none', background: activeSoalTab === 'pjutd' ? '#e0e7ff' : 'transparent', color: activeSoalTab === 'pjutd' ? '#4338ca' : '#64748b', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setActiveSoalTab('pjutd')}
          >Laporan PJ UT-D (Lembaga)</button>
        </div>
        
        {loadingKategori ? <p>Memuat form builder...</p> : (
          <div className="flex flex-col gap-6">
            {kategoriList.map((kategori, kIndex) => (
              <div key={kategori.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button onClick={() => moveKategori(kIndex, 'up')} disabled={kIndex === 0} style={{ background: 'none', border: 'none', cursor: kIndex === 0 ? 'not-allowed' : 'pointer', color: kIndex === 0 ? '#cbd5e1' : '#64748b', padding: 0 }}><MoveUp size={14} /></button>
                      <button onClick={() => moveKategori(kIndex, 'down')} disabled={kIndex === kategoriList.length - 1} style={{ background: 'none', border: 'none', cursor: kIndex === kategoriList.length - 1 ? 'not-allowed' : 'pointer', color: kIndex === kategoriList.length - 1 ? '#cbd5e1' : '#64748b', padding: 0 }}><MoveDown size={14} /></button>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{kategori.nama_kategori}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px', fontSize: '0.75rem' }} onClick={() => { 
                      setIsEditMode(false); 
                      setGlobalTargetLevel(activeSoalTab);
                      setSelectedKategoriId(kategori.id);
                      setSoalForms([{ tipe_soal: 'uraian', opsi_jawaban: [''], is_active: true }]); 
                      setIsSoalModalOpen(true); 
                    }}>
                      <Plus size={14} /> Tambah Soal
                    </button>
                    <button className="btn" style={{ padding: '6px' }} onClick={() => { 
                      setIsEditKategoriMode(true); 
                      setKategoriForm({ ...kategori }); 
                      setIsKategoriModalOpen(true); 
                    }}><Edit2 size={14} /></button>
                    <button className="btn" style={{ padding: '6px', color: '#ef4444' }} onClick={() => deleteKategoriMutation.mutate(kategori.id)}><Trash2 size={14} /></button>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    {kategori.soal_laporan?.map((s, sIndex) => (
                      <tr key={s.id} style={{ borderBottom: sIndex === kategori.soal_laporan!.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', width: '60%' }}>{s.pertanyaan}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.875rem' }}>{s.tipe_soal === 'uraian' ? 'Uraian' : s.tipe_soal === 'pilihan_ganda_multi' ? 'Pilihan Ganda Multi' : s.tipe_soal === 'uraian_multi' ? 'Uraian Multi' : 'Pilihan Ganda'}</td>
                        <td style={{ padding: '12px 16px', color: s.is_active ? '#10b981' : '#94a3b8', fontSize: '0.875rem' }}>{s.is_active ? 'Aktif' : 'Nonaktif'}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn" style={{ padding: '6px' }} onClick={() => { 
                            setIsEditMode(true); 
                            setGlobalTargetLevel(s.target_level);
                            setSelectedKategoriId(s.kategori_soal_id);
                            setSoalForms([{ ...s }]); 
                            setIsSoalModalOpen(true); 
                          }}><Edit2 size={14} /></button>
                          <button className="btn" style={{ padding: '6px', color: 'red' }} onClick={() => deleteSoalMutation.mutate(s.id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {(!kategori.soal_laporan || kategori.soal_laporan.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Belum ada soal di kategori ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
            {kategoriList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
                <p>Belum ada kategori soal. Buat kategori terlebih dahulu.</p>
                <button className="btn btn-outline" style={{ marginTop: '12px' }} onClick={() => { setIsEditKategoriMode(false); setKategoriForm({ nama_kategori: '' }); setIsKategoriModalOpen(true); }}>
                  Buat Kategori
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Kategori */}
      <Modal isOpen={isKategoriModalOpen} onClose={() => setIsKategoriModalOpen(false)} title={isEditKategoriMode ? "Edit Kategori" : "Tambah Kategori Baru"}>
        <form onSubmit={handleSaveKategori} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Nama Kategori</label>
            <input type="text" className="form-control" value={kategoriForm.nama_kategori || ''} onChange={e => setKategoriForm({...kategoriForm, nama_kategori: e.target.value})} required placeholder="Misal: Kegiatan Mengajar" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn" onClick={() => setIsKategoriModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Kategori</button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah/Edit Soal */}
      <Modal isOpen={isSoalModalOpen} onClose={() => setIsSoalModalOpen(false)} title={isEditMode ? "Edit Soal" : "Tambah Soal (Bisa Sekaligus Banyak)"}>
        <form onSubmit={handleSaveSoal} className="flex flex-col gap-6">
          
          <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ fontWeight: 'bold' }}>Kategori Soal</label>
            <select className="form-control" value={selectedKategoriId || ''} onChange={e => setSelectedKategoriId(Number(e.target.value) || null)} required>
              <option value="">Pilih Kategori...</option>
              {kategoriList.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kategori}</option>
              ))}
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
                  <select className="form-control" value={form.tipe_soal} onChange={e => {
                    const newType = e.target.value;
                    let initialOpsi: any[] | null = null;
                    if (newType === 'pilihan_ganda' || newType === 'uraian_multi') initialOpsi = [''];
                    if (newType === 'pilihan_ganda_multi') initialOpsi = [{ label: '', options: [''] }];
                    
                    const newForms = [...soalForms];
                    newForms[formIndex] = { ...newForms[formIndex], tipe_soal: newType, opsi_jawaban: initialOpsi };
                    setSoalForms(newForms);
                  }}>
                    <option value="uraian">Uraian Panjang</option>
                    <option value="uraian_multi">Uraian Multi (Kelompok)</option>
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="pilihan_ganda_multi">Pilihan Ganda Multi (Kelompok)</option>
                  </select>
                </div>
                {(form.tipe_soal === 'pilihan_ganda' || form.tipe_soal === 'uraian_multi') && (
                  <div className="form-group">
                    <label className="form-label">{form.tipe_soal === 'uraian_multi' ? 'Label/Pertanyaan Uraian' : 'Opsi Jawaban'}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Array.isArray(form.opsi_jawaban) && form.opsi_jawaban.map((opsi: any, opsiIndex: number) => typeof opsi === 'string' && (
                        <div key={opsiIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#94a3b8', width: '24px' }}>{form.tipe_soal === 'uraian_multi' ? `${opsiIndex + 1}.` : `${String.fromCharCode(65 + opsiIndex)}.`}</span>
                          <input type="text" className="form-control" value={opsi} onChange={e => updateOpsi(formIndex, opsiIndex, e.target.value)} placeholder={form.tipe_soal === 'uraian_multi' ? `Label ${opsiIndex+1} (Misal: Kelebihan)` : `Opsi ${opsiIndex+1}`} required style={{ flex: 1 }} />
                          {form.opsi_jawaban!.length > 1 && (
                            <button type="button" onClick={() => removeOpsi(formIndex, opsiIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '8px', alignSelf: 'flex-start', background: '#f1f5f9' }} onClick={() => addOpsi(formIndex)}>+ Tambah {form.tipe_soal === 'uraian_multi' ? 'Label Uraian' : 'Opsi'}</button>
                  </div>
                )}
                {form.tipe_soal === 'pilihan_ganda_multi' && (
                  <div className="form-group">
                    <label className="form-label">Kelompok Opsi Jawaban</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Array.isArray(form.opsi_jawaban) && form.opsi_jawaban.map((group: any, groupIndex: number) => typeof group === 'object' && (
                        <div key={groupIndex} style={{ padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative' }}>
                          {form.opsi_jawaban!.length > 1 && (
                            <button type="button" onClick={() => removeMultiGroup(formIndex, groupIndex)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Nama Kelompok (Misal: Tingkat)</label>
                            <input type="text" className="form-control" value={group.label} onChange={e => updateMultiGroupLabel(formIndex, groupIndex, e.target.value)} placeholder="Nama Kelompok..." required style={{ width: '80%' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Pilihan Jawaban</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {group.options.map((opt: string, optIndex: number) => (
                                <div key={optIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '0.8rem', width: '20px' }}>{optIndex + 1}.</span>
                                  <input type="text" className="form-control" value={opt} onChange={e => updateMultiOpsi(formIndex, groupIndex, optIndex, e.target.value)} placeholder={`Pilihan ${optIndex+1}`} required style={{ flex: 1, padding: '4px 8px', fontSize: '0.9rem' }} />
                                  {group.options.length > 1 && (
                                    <button type="button" onClick={() => removeMultiOpsi(formIndex, groupIndex, optIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.7rem', marginTop: '8px', alignSelf: 'flex-start', background: '#fff', border: '1px solid #cbd5e1' }} onClick={() => addMultiOpsi(formIndex, groupIndex)}>+ Tambah Pilihan</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '12px', alignSelf: 'flex-start', background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }} onClick={() => addMultiGroup(formIndex)}>+ Tambah Kelompok Baru</button>
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

    </div>
  );
};

export default SoalLaporanPage;
