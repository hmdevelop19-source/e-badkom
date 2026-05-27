import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

const PengajuanBoyongPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [nis, setNis] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { nis: string, keterangan: string }) => {
      return api.post('/boyong', data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      queryClient.invalidateQueries({ queryKey: ['boyong-menunggu'] });
      setMessage({ type: 'success', text: res.data.message || 'Pengajuan boyong berhasil dikirim dan menunggu validasi admin.' });
      setNis('');
      setKeterangan('');
    },
    onError: (err: any) => {
      // The backend handles validation and returns 422 if tasks are not complete
      const errorText = err.response?.data?.message || 'Terjadi kesalahan saat mengajukan boyong.';
      setMessage({ type: 'error', text: errorText });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) {
      setMessage({ type: 'error', text: 'NIS tidak boleh kosong.' });
      return;
    }
    mutation.mutate({ nis, keterangan });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <Send size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Pengajuan Boyong (Kelulusan)</h2>
        </div>
        
        <div style={{ marginBottom: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Gunakan formulir ini untuk mengajukan kelulusan tugas (boyong). Sistem akan otomatis memeriksa apakah santri dengan NIS yang dimasukkan telah menyelesaikan target tugas wajib.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>NIS Santri</label>
            <input 
              type="text" 
              className="form-control" 
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="Masukkan Nomor Induk Santri (NIS)"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Keterangan (Opsional)</label>
            <textarea 
              className="form-control" 
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan..."
              rows={3}
            />
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={mutation.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              <Send size={18} />
              {mutation.isPending ? 'Memproses...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PengajuanBoyongPage;
