import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { TablePagination } from '../TablePagination';
import type { Santri } from '../../types/santri';

interface SantriTableProps {
  isLoading: boolean;
  santris: Santri[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  targetTugasWajib: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onView: (santriId: number) => void;
  onEdit: (santri: Santri) => void;
  onDelete: (santriId: number) => void;
}

export const SantriTable: React.FC<SantriTableProps> = ({
  isLoading,
  santris,
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  targetTugasWajib,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>NIS</th>
            <th>Nama Lengkap</th>
            <th>Status</th>
            <th>Progress Tugas Wajib</th>
            <th style={{ textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</td>
            </tr>
          ) : santris.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data yang ditemukan.</td>
            </tr>
          ) : santris.map((s) => (
            <tr key={s.id}>
              <td style={{ fontWeight: 600, color: '#334155' }}>{s.nis}</td>
              <td style={{ fontWeight: 500, color: '#0f172a' }}>{s.nama}</td>
              <td>
                <span style={{ 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  background: s.status_santri === 'Menunggu Boyong' ? '#fef3c7' : '#f0fdfa', 
                  color: s.status_santri === 'Menunggu Boyong' ? '#b45309' : '#0f766e', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  border: `1px solid ${s.status_santri === 'Menunggu Boyong' ? '#fde68a' : '#ccfbf1'}`
                }}>
                  {s.status_santri || 'Aktif'}
                </span>
              </td>
              <td>
                {(() => {
                  const validLulus = s.utds?.filter(u => u.penilaian?.keterangan === 'Lulus').length || 0;
                  const progress = Math.min((validLulus / targetTugasWajib) * 100, 100);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '160px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ color: validLulus >= targetTugasWajib ? '#15803d' : '#64748b' }}>
                          {validLulus} / {targetTugasWajib} Lulus
                        </span>
                        <span style={{ color: validLulus >= targetTugasWajib ? '#15803d' : '#ca8a04' }}>
                          {validLulus >= targetTugasWajib ? 'Selesai' : 'Belum Selesai'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: validLulus >= targetTugasWajib ? '#22c55e' : 'var(--secondary)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  );
                })()}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                  <button 
                    className="action-btn view"
                    onClick={() => onView(s.id)}
                    title="Lihat Detail"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => onEdit(s)}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button className="action-btn delete" title="Hapus" onClick={() => onDelete(s.id)}><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {!isLoading && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};
