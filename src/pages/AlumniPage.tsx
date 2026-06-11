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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }

        .search-container {
          position: relative;
          width: 320px;
        }
        
        .search-input {
          width: 100%;
          padding: 8px 16px 8px 40px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .search-input:focus {
          background: #ffffff;
          border-color: var(--secondary);
          box-shadow: 0 0 0 4px rgba(0, 143, 215, 0.1);
          outline: none;
        }

        .data-table-container {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          overflow-y: hidden;
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 18px 24px;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .data-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
          vertical-align: middle;
        }

        .data-table tbody tr {
          transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
          background: #f8fafc;
          transform: scale(1.001);
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-green-50 text-green-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <h2 className="m-0 text-xl text-slate-900 font-bold">Daftar Alumni <span className="text-slate-400 text-base font-medium">(Purna Tugas)</span></h2>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all text-sm"
            placeholder="Cari alumni..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Santri</th>
              <th>Nomor Surat Kelulusan</th>
              <th>Tanggal Lulus</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
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
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{a.nama}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>NIS: {a.nis}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                      {a.boyong?.no_surat || '-'}
                    </span>
                  </td>
                  <td style={{ color: '#475569', fontWeight: 500 }}>
                    {a.boyong?.tanggal_lulus ? new Date(a.boyong.tanggal_lulus).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '8px 16px', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(66, 47, 111, 0.2)' }}
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
