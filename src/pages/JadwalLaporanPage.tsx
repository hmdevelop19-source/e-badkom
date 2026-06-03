import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import toast from 'react-hot-toast';

interface JadwalLaporan {
  kategori_bulan: string;
  batas_tanggal: string;
}

const KATEGORI_BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => `Bulan Ke-${i + 1}`);

const initialJadwals = KATEGORI_BULAN_OPTIONS.reduce((acc, cat) => {
  acc[cat] = '';
  return acc;
}, {} as Record<string, string>);

const JadwalLaporanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>('');
  
  const [jadwals, setJadwals] = useState<Record<string, string>>(initialJadwals);

  const { data: tahunAjarans = [] } = useQuery({
    queryKey: ['tahun-ajaran'],
    queryFn: async () => {
      const response = await api.get('/tahun-ajaran');
      return response.data;
    }
  });

  const { data: jadwalData, isLoading } = useQuery({
    queryKey: ['jadwal-laporan', selectedTahunAjaranId],
    queryFn: async () => {
      const params = selectedTahunAjaranId ? { tahun_ajaran_id: selectedTahunAjaranId } : {};
      const response = await api.get('/jadwal-laporan-wajib', { params });
      return response.data;
    },
    enabled: !!selectedTahunAjaranId
  });

  useEffect(() => {
    if (!jadwalData) return;

    if (jadwalData.length > 0) {
      const updated = { ...initialJadwals };
      jadwalData.forEach((j: any) => {
        if (j.kategori_bulan && j.batas_tanggal) {
          updated[j.kategori_bulan] = j.batas_tanggal.split('T')[0];
        }
      });
      setJadwals(updated);
    } else {
      setJadwals(initialJadwals);
    }
  }, [jadwalData]);

  useEffect(() => {
    if (tahunAjarans.length > 0 && !selectedTahunAjaranId) {
      const active = tahunAjarans.find((ta: any) => ta.is_active);
      if (active) setSelectedTahunAjaranId(active.id.toString());
    }
  }, [tahunAjarans]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return api.post('/jadwal-laporan-wajib', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-laporan'] });
      toast.success('Jadwal laporan berhasil disimpan!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan jadwal laporan.');
    }
  });

  const handleSave = () => {
    if (!selectedTahunAjaranId) {
      toast.error('Pilih Tahun Ajaran terlebih dahulu');
      return;
    }

    const jadwalsArray = Object.keys(jadwals)
      .filter(k => jadwals[k])
      .map(k => ({
        kategori_bulan: k,
        batas_tanggal: jadwals[k]
      }));

    if (jadwalsArray.length === 0) {
      toast.error('Belum ada tanggal yang diisi');
      return;
    }

    mutation.mutate({
      tahun_ajaran_id: parseInt(selectedTahunAjaranId),
      jadwals: jadwalsArray
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Jadwal Laporan Wajib</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="form-control"
            value={selectedTahunAjaranId}
            onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">-- Pilih Tahun Ajaran --</option>
            {tahunAjarans.map((ta: any) => (
              <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran} {ta.is_active ? '(Aktif)' : '(Arsip)'}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={mutation.isPending || !selectedTahunAjaranId}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      <div className="card">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Atur batas waktu maksimal pelaporan ustadz untuk setiap bulan. Laporan yang dikirim melewati batas waktu ini akan tetap diterima namun ditandai sebagai "Tidak Tepat Waktu".
        </p>

        {isLoading ? (
          <div>Memuat data jadwal...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {KATEGORI_BULAN_OPTIONS.map(kategori => (
              <div key={kategori} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{kategori}</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={jadwals[kategori] || ''}
                  onChange={(e) => setJadwals({...jadwals, [kategori]: e.target.value})}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalLaporanPage;
