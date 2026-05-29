import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { MapPin, Search, Edit2, Trash2, Printer } from 'lucide-react';
import Modal from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { TablePagination } from '../components/TablePagination';

interface Utd {
  id: number;
  santri_id: number;
  pjutd_id: number;
  tahun_ajaran_id: number;
  tahun_ajaran?: {
    id: number;
    nama_tahun_ajaran: string;
    is_active: boolean;
  };
  santri?: {
    id: number;
    nis: string;
    nama: string;
  };
  pjutd?: {
    id: number;
    kode_lembaga: string;
    nama_pjutd: string;
  };
}

const PenugasanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Utd>>({ santri_id: undefined, pjutd_id: undefined });
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: tahunAjarans = [] } = useQuery({
    queryKey: ['tahun-ajaran'],
    queryFn: async () => {
      const response = await api.get('/tahun-ajaran');
      return response.data;
    }
  });

  const { data: utds = [], isLoading } = useQuery<Utd[]>({
    queryKey: ['utd', selectedTahunAjaranId],
    queryFn: async () => {
      const params = selectedTahunAjaranId ? { tahun_ajaran_id: selectedTahunAjaranId } : {};
      const response = await api.get('/utd', { params });
      return response.data;
    }
  });

  const { data: santris = [] } = useQuery({
    queryKey: ['santri-list'],
    queryFn: async () => {
      const response = await api.get('/santri');
      return response.data;
    }
  });

  const { data: pjutds = [] } = useQuery({
    queryKey: ['pjutd-list'],
    queryFn: async () => {
      const response = await api.get('/pjutd');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Utd>) => {
      if (data.id) {
        return api.put(`/utd/${data.id}`, data);
      }
      return api.post('/utd', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utd'] });
      setIsModalOpen(false);
      setFormData({ santri_id: undefined, pjutd_id: undefined });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan penugasan. Pastikan santri belum ditugaskan di tempat lain.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/utd/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utd'] });
    },
    onError: () => {
      alert('Gagal menghapus penugasan.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.santri_id || !formData.pjutd_id) {
      setError('Santri dan PJ UTD harus dipilih');
      return;
    }
    mutation.mutate(formData);
  };

  const filteredUtds = utds.filter(utd => 
    utd.santri?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utd.santri?.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    utd.pjutd?.nama_pjutd.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUtds.length / itemsPerPage);
  const paginatedUtds = filteredUtds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTahunAjaranId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Cari penugasan..." 
            style={{ paddingLeft: '40px' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="form-control"
            value={selectedTahunAjaranId}
            onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">Tahun Ajaran Aktif</option>
            {tahunAjarans.map((ta: any) => (
              <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
            ))}
          </select>
          <button 
            className="btn" 
            style={{ background: '#f1f5f9', color: '#334155' }}
            onClick={async () => {
              try {
                const url = `/cetak/penugasan${selectedTahunAjaranId ? '?tahun_ajaran_id=' + selectedTahunAjaranId : ''}`;
                // Cast skipToast since we added it to interceptor config
                const response = await api.get(url, { responseType: 'blob', skipToast: true } as any);
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, '_blank');
              } catch (error) {
                alert('Gagal membuat PDF');
              }
            }}
          >
            <Printer size={18} />
            Cetak Penempatan
          </button>
          <button className="btn btn-primary" onClick={() => { setFormData({ santri_id: undefined, pjutd_id: undefined }); setIsModalOpen(true); setError(''); }}>
            <MapPin size={18} />
            Tambah Penugasan
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Santri</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lokasi PJ UTD</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tahun Ajaran</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedUtds.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data penugasan</td>
              </tr>
            ) : (
              paginatedUtds.map((utd) => (
                <tr key={utd.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{utd.santri?.nama}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>NIS: {utd.santri?.nis}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{utd.pjutd?.nama_pjutd}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kode: {utd.pjutd?.kode_lembaga}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{utd.tahun_ajaran?.nama_tahun_ajaran}</div>
                    {utd.tahun_ajaran && !utd.tahun_ajaran.is_active && (
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>Arsip</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '8px', background: '#f1f5f9', color: '#475569' }}
                        onClick={() => {
                          setFormData(utd);
                          setIsModalOpen(true);
                          setError('');
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '8px', background: '#fef2f2', color: '#ef4444' }}
                        onClick={() => {
                          if (window.confirm('Apakah Anda yakin ingin menghapus penugasan ini?')) {
                            deleteMutation.mutate(utd.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUtds.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={formData.id ? "Edit Penugasan" : "Tambah Penugasan"}
        overflowVisible={true}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Santri</label>
            <SearchableSelect 
              options={santris
                .filter((s: any) => !utds.some(u => u.santri_id === s.id) || s.id === formData.santri_id)
                .map((s: any) => ({ value: s.id, label: `${s.nis} - ${s.nama}` }))}
              value={formData.santri_id}
              onChange={(val) => setFormData({...formData, santri_id: Number(val)})}
              placeholder="-- Cari dan Pilih Santri --"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PJ UTD (Lokasi Tugas)</label>
            <SearchableSelect 
              options={pjutds
                .filter((p: any) => !utds.some(u => u.pjutd_id === p.id) || p.id === formData.pjutd_id)
                .map((p: any) => ({ value: p.id, label: `${p.kode_lembaga} - ${p.nama_pjutd}` }))}
              value={formData.pjutd_id}
              onChange={(val) => setFormData({...formData, pjutd_id: Number(val)})}
              placeholder="-- Cari dan Pilih PJ UTD --"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PenugasanPage;
