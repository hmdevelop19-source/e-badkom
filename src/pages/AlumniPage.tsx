import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { GraduationCap, Printer, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { TablePagination } from '../components/TablePagination';

const AlumniPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ['alumni'],
    queryFn: async () => {
      // Kita panggil dari santri controller dengan filter status=Alumni
      const response = await api.get('/santri?status=Alumni');
      return response.data;
    }
  });

  const filteredAlumni = alumni.filter((a: any) => 
    a.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.nis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const paginatedAlumni = filteredAlumni.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Cari alumni..." 
            style={{ paddingLeft: '40px', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <GraduationCap size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Daftar Alumni (Purna Tugas)</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Santri</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nomor Surat Kelulusan</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tanggal Lulus</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
              </tr>
            ) : paginatedAlumni.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data alumni.</td>
              </tr>
            ) : (
              paginatedAlumni.map((a: any) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.nama}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>NIS: {a.nis}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 500, color: '#0369a1' }}>
                    {a.boyong?.no_surat || '-'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {a.boyong?.tanggal_lulus ? new Date(a.boyong.tanggal_lulus).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      onClick={async () => {
                        try {
                          const response = await api.get(`/cetak/surat-lulus-tugas/${a.id}`, { responseType: 'blob', skipToast: true } as any);
                          const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                          window.open(fileURL, '_blank');
                        } catch (error) {
                          toast.error('Gagal memuat PDF');
                        }
                      }}
                    >
                      <Printer size={16} /> Cetak Surat
                    </button>
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
            totalItems={filteredAlumni.length}
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

export default AlumniPage;
