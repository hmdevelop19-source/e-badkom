import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Shield, Check, X, Search } from 'lucide-react';
import { TablePagination } from '../components/TablePagination';

const PenilaianValidasiPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';
  
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
  const { data: penilaians = [], isLoading } = useQuery({
    queryKey: ['penilaian'],
    queryFn: async () => {
      const response = await api.get('/penilaian');
      return response.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => 
      api.put(`/penilaian/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disetujui': return { bg: '#dcfce7', text: '#166534' };
      case 'Ditolak': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#fef9c3', text: '#854d0e' };
    }
  };

  const filteredPenilaians = penilaians.filter((p: any) => 
    p.utd?.santri?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.utd?.pjutd?.nama_pjutd.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPenilaians.length / itemsPerPage);
  const paginatedPenilaians = filteredPenilaians.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0 }}>Validasi Penilaian Santri</h2>
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Cari santri atau tempat tugas..." 
              style={{ paddingLeft: '40px', width: '100%' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Santri & Tahun</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tempat Tugas</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hasil Penilaian</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Validasi (Pusat)</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedPenilaians.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada penilaian yang masuk</td>
              </tr>
            ) : (
              paginatedPenilaians.map((p: any) => {
                const sPusatColor = getStatusColor(p.status_badkom_pusat);
                
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.utd?.santri?.nama}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>TA: {p.utd?.tahun_ajaran?.nama_tahun_ajaran}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 500 }}>{p.utd?.pjutd?.nama_pjutd}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {p.utd?.pjutd?.badkom?.nama_pj}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: p.keterangan === 'Lulus' ? '#dcfce7' : '#fee2e2',
                          color: p.keterangan === 'Lulus' ? '#166534' : '#991b1b'
                        }}>
                          {p.keterangan} ({p.predikat})
                        </span>
                      </div>
                      {p.catatan && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Catatan: {p.catatan}</div>}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: sPusatColor.bg, color: sPusatColor.text }}>
                        {p.status_badkom_pusat}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {['admin', 'badkom_pusat'].includes(level) && p.status_badkom_pusat === 'Menunggu' ? (
                          <>
                            <button 
                              className="btn" 
                              style={{ padding: '6px', background: '#dcfce7', color: '#166534' }}
                              onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'Disetujui' })}
                              title="Setujui"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="btn" 
                              style={{ padding: '6px', background: '#fee2e2', color: '#991b1b' }}
                              onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'Ditolak' })}
                              title="Tolak"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                           <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{p.status_badkom_pusat === 'Menunggu' ? 'Menunggu Validasi' : 'Sudah divalidasi'}</span>
                        )}
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
            totalItems={filteredPenilaians.length}
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

export default PenilaianValidasiPage;
