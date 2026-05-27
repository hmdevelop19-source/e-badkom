import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { TablePagination } from '../components/TablePagination';

const ValidasiBoyongPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const { data: boyongs = [], isLoading } = useQuery({
    queryKey: ['boyong-menunggu'],
    queryFn: async () => {
      const response = await api.get('/boyong?status=Menunggu');
      return response.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => 
      api.put(`/boyong/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boyong-menunggu'] });
      alert('Status berhasil diperbarui.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal memperbarui status.');
    }
  });

  const totalPages = Math.ceil(boyongs.length / itemsPerPage);
  const paginatedBoyongs = boyongs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Clock size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Validasi Pengajuan Boyong (Kelulusan Tugas)</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Santri</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tanggal Pengajuan</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Tugas</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedBoyongs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada pengajuan boyong yang menunggu validasi.</td>
              </tr>
            ) : (
              paginatedBoyongs.map((b: any) => {
                const validLulus = b.santri?.utds?.filter((u: any) => u.penilaian?.keterangan === 'Lulus' && u.penilaian?.status_badkom_wilayah === 'Disetujui' && u.penilaian?.status_badkom_pusat === 'Disetujui').length || 0;
                
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.santri?.nama}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>NIS: {b.santri?.nis}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {new Date(b.tanggal_pengajuan).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontWeight: 700, color: '#166534' }}>{validLulus} Tugas Selesai</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '8px', background: '#dcfce7', color: '#166534' }}
                          onClick={() => {
                            if(window.confirm('Setujui pengajuan ini dan terbitkan Surat Kelulusan?')) {
                              updateStatusMutation.mutate({ id: b.id, status: 'Disetujui' });
                            }
                          }}
                          title="Setujui & Luluskan"
                        >
                          <CheckCircle size={16} /> Setujui
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '8px', background: '#fee2e2', color: '#991b1b' }}
                          onClick={() => {
                            if(window.confirm('Tolak pengajuan ini?')) {
                              updateStatusMutation.mutate({ id: b.id, status: 'Ditolak' });
                            }
                          }}
                          title="Tolak"
                        >
                          <XCircle size={16} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!isLoading && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={boyongs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ValidasiBoyongPage;
