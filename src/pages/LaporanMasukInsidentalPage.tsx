import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  is_active: boolean;
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

const LaporanMasukInsidentalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | ''>('');
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

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

  const { data: laporanMendesakList = [], isLoading } = useQuery<LaporanMendesak[]>({
    queryKey: ['laporan_mendesak'],
    queryFn: async () => {
      const res = await api.get('/laporan-mendesak');
      return res.data;
    }
  });

  const updateStatusMendesakMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => api.put(`/laporan-mendesak/${data.id}/status`, { status_penyelesaian: data.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['laporan_mendesak'] })
  });

  // Filter only subordinates' reports (not own reports) AND by selectedTahunAjaran
  const incomingReports = laporanMendesakList.filter(l => 
    l.user?.id !== currentUser?.id && 
    l.tahun_ajaran_id === selectedTahunAjaran
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="#ef4444" />
            <h3 style={{ margin: 0 }}>Daftar Laporan Insidental (Mendesak) Masuk</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tahun Ajaran:</span>
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
        </div>

        {isLoading ? <p>Memuat laporan masuk...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {incomingReports.map(laporan => (
              <div key={laporan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: laporan.status_penyelesaian === 'Selesai' ? '#f8fafc' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem' }}>{laporan.judul}</h4>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '16px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    background: laporan.status_penyelesaian === 'Menunggu' ? '#fee2e2' : laporan.status_penyelesaian === 'Diproses' ? '#fef3c7' : '#dcfce7',
                    color: laporan.status_penyelesaian === 'Menunggu' ? '#b91c1c' : laporan.status_penyelesaian === 'Diproses' ? '#b45309' : '#15803d',
                  }}>
                    {laporan.status_penyelesaian.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
                  Dari: <strong>{laporan.user?.fullname}</strong> ({laporan.user?.level}) • {new Date(laporan.created_at).toLocaleString('id-ID')} • T.A: {laporan.tahunAjaran?.nama_tahun_ajaran}
                </div>
                <div style={{ fontSize: '0.875rem', margin: '0 0 20px 0', whiteSpace: 'pre-wrap', background: '#f1f5f9', padding: '16px', borderRadius: '8px' }}>
                  {laporan.isi_laporan}
                </div>
                
                {/* Status update buttons for superiors */}
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>Ubah Status Penanganan:</span>
                  <button 
                    className="btn" 
                    style={{ padding: '8px 16px', fontSize: '0.875rem', background: '#fef3c7', color: '#b45309', opacity: laporan.status_penyelesaian === 'Diproses' ? 0.5 : 1 }}
                    onClick={() => updateStatusMendesakMutation.mutate({ id: laporan.id, status: 'Diproses' })}
                    disabled={laporan.status_penyelesaian === 'Diproses'}
                  >
                    <Clock size={16} /> Tandai Sedang Diproses
                  </button>
                  <button 
                    className="btn" 
                    style={{ padding: '8px 16px', fontSize: '0.875rem', background: '#dcfce7', color: '#15803d', opacity: laporan.status_penyelesaian === 'Selesai' ? 0.5 : 1 }}
                    onClick={() => updateStatusMendesakMutation.mutate({ id: laporan.id, status: 'Selesai' })}
                    disabled={laporan.status_penyelesaian === 'Selesai'}
                  >
                    <CheckCircle size={16} /> Tandai Masalah Selesai
                  </button>
                </div>
              </div>
            ))}
            
            {incomingReports.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
                <AlertCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p>Belum ada laporan insidental dari bawahan Anda pada Tahun Ajaran yang dipilih.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default LaporanMasukInsidentalPage;
