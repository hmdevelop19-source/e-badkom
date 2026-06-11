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
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden overflow-x-auto w-full">
      <table className="w-full min-w-max text-left border-collapse">
        <thead>
          <tr>
            <th className="px-6 py-4 font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase text-xs tracking-wider">NIS</th>
            <th className="px-6 py-4 font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase text-xs tracking-wider">Nama Lengkap</th>
            <th className="px-6 py-4 font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase text-xs tracking-wider">Status</th>
            <th className="px-6 py-4 font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase text-xs tracking-wider">Progress Tugas Wajib</th>
            <th className="px-6 py-4 font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase text-xs tracking-wider text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Memuat data...</td>
            </tr>
          ) : santris.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Tidak ada data yang ditemukan.</td>
            </tr>
          ) : santris.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-700">{s.nis}</td>
              <td className="px-6 py-4 border-b border-slate-100 font-medium text-slate-900">{s.nama}</td>
              <td className="px-6 py-4 border-b border-slate-100">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${s.status_santri === 'Menunggu Boyong' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                  {s.status_santri || 'Aktif'}
                </span>
              </td>
              <td className="px-6 py-4 border-b border-slate-100">
                {(() => {
                  const validLulus = s.utds?.filter(u => u.penilaian?.keterangan === 'Lulus').length || 0;
                  const progress = Math.min((validLulus / targetTugasWajib) * 100, 100);

                  return (
                    <div className="flex flex-col gap-1.5 w-40">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className={validLulus >= targetTugasWajib ? 'text-green-700' : 'text-slate-500'}>
                          {validLulus} / {targetTugasWajib} Lulus
                        </span>
                        <span className={validLulus >= targetTugasWajib ? 'text-green-700' : 'text-amber-600'}>
                          {validLulus >= targetTugasWajib ? 'Selesai' : 'Belum Selesai'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${validLulus >= targetTugasWajib ? 'bg-green-500' : 'bg-[#008FD7]'}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </td>
              <td className="px-6 py-4 border-b border-slate-100 text-right">
                <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-sky-600 hover:bg-sky-100 transition-colors"
                    onClick={() => onView(s.id)}
                    title="Lihat Detail"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    onClick={() => onEdit(s)}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors" 
                    title="Hapus" 
                    onClick={() => onDelete(s.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {!isLoading && (
        <div className="border-t border-slate-100 p-2">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};
