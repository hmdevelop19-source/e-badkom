import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import Modal from '../components/Modal';
import { TablePagination } from '../components/TablePagination';

interface Soal {
  id: number;
  target_level: string;
  pertanyaan: string;
  tipe_soal: string;
  opsi_jawaban: string[] | null;
  is_active: boolean;
}

const SoalLaporanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSoalTab, setActiveSoalTab] = useState<'utd' | 'pjutd' | 'badkom_wilayah'>('utd');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [isSoalModalOpen, setIsSoalModalOpen] = useState(false);

  // Forms
  const [soalForms, setSoalForms] = useState<Partial<Soal>[]>([{ tipe_soal: 'uraian', opsi_jawaban: [''] }]);
  const [globalTargetLevel, setGlobalTargetLevel] = useState('utd');
  const [isEditMode, setIsEditMode] = useState(false);

  // Queries
  const { data: soalList = [], isLoading: loadingSoal } = useQuery<Soal[]>({
    queryKey: ['soal_laporan'],
    queryFn: async () => {
      const res = await api.get('/soal-laporan');
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

  const filteredSoalList = soalList.filter(s => s.target_level === activeSoalTab);
  const totalSoalPages = Math.ceil(filteredSoalList.length / itemsPerPage);
  const paginatedSoalList = filteredSoalList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSoalTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0 }}>Bank Soal Laporan</h2>
          </div>
          <button className="btn btn-primary" onClick={() => { 
            setIsEditMode(false); 
            setGlobalTargetLevel(activeSoalTab);
            setSoalForms([{ tipe_soal: 'uraian', opsi_jawaban: [''], is_active: true }]); 
            setIsSoalModalOpen(true); 
          }}>
            <Plus size={18} /> Tambah Soal untuk {activeSoalTab === 'utd' ? 'UTD' : activeSoalTab === 'pjutd' ? 'PJ UTD' : 'Badkom Wilayah'}
          </button>
        </div>

        {/* Sub-tabs for Target Level */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
          <button 
            style={{ padding: '8px 16px', border: 'none', background: activeSoalTab === 'utd' ? '#e0e7ff' : 'transparent', color: activeSoalTab === 'utd' ? '#4338ca' : '#64748b', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setActiveSoalTab('utd')}
          >Soal UTD (Santri)</button>
          <button 
            style={{ padding: '8px 16px', border: 'none', background: activeSoalTab === 'pjutd' ? '#e0e7ff' : 'transparent', color: activeSoalTab === 'pjutd' ? '#4338ca' : '#64748b', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setActiveSoalTab('pjutd')}
          >Soal PJ UTD (Lembaga)</button>
          <button 
            style={{ padding: '8px 16px', border: 'none', background: activeSoalTab === 'badkom_wilayah' ? '#e0e7ff' : 'transparent', color: activeSoalTab === 'badkom_wilayah' ? '#4338ca' : '#64748b', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setActiveSoalTab('badkom_wilayah')}
          >Soal Badkom Wilayah</button>
        </div>
        
        {loadingSoal ? <p>Memuat soal...</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px', width: '60%' }}>Pertanyaan</th>
                <th style={{ padding: '12px' }}>Tipe</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSoalList.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
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
              {paginatedSoalList.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Belum ada soal untuk kategori ini.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {filteredSoalList.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalSoalPages}
              totalItems={filteredSoalList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(limit) => {
                setItemsPerPage(limit);
                setCurrentPage(1);
              }}
            />
          )}
          </>
        )}
      </div>

      {/* Modal Tambah/Edit Soal */}
      <Modal isOpen={isSoalModalOpen} onClose={() => setIsSoalModalOpen(false)} title={isEditMode ? "Edit Soal" : "Tambah Soal (Bisa Sekaligus Banyak)"}>
        <form onSubmit={handleSaveSoal} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label className="form-label" style={{ fontWeight: 'bold' }}>Target Pengisi Soal {isEditMode ? '' : '(Terkunci sesuai tab yang dipilih)'}</label>
            <select className="form-control" value={globalTargetLevel} disabled style={{ background: '#e2e8f0', cursor: 'not-allowed' }}>
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

    </div>
  );
};

export default SoalLaporanPage;
