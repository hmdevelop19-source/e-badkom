import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { UserPlus, Search, Edit2, Trash2 } from 'lucide-react';

interface Santri {
  id: number;
  nis: string;
  nama: string;
}

const SantriPage: React.FC = () => {
  const { data: santris, isLoading } = useQuery<Santri[]>({
    queryKey: ['santri'],
    queryFn: async () => {
      // For now we'll skip auth for this call or assume it works
      const response = await api.get('/santri');
      return response.data;
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Cari santri..." style={{ paddingLeft: '40px' }} />
        </div>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          Tambah Santri
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>NIS</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : santris?.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{s.nis}</td>
                <td style={{ padding: '16px 24px' }}>{s.nama}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }}>Aktif</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button style={{ p: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                    <button style={{ p: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SantriPage;
