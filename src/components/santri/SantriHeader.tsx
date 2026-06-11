import React, { useRef } from 'react';
import { Search, UserPlus, Download, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import { ActionDropdown } from '../ActionDropdown';

interface SantriHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onAdd: () => void;
  onImportCSV: (file: File) => void;
  onImportExcel: (file: File) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onDownloadTemplateCSV: () => void;
  onDownloadTemplateExcel: () => void;
}

export const SantriHeader: React.FC<SantriHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onAdd,
  onImportCSV,
  onImportExcel,
  onExportCSV,
  onExportExcel,
  onDownloadTemplateCSV,
  onDownloadTemplateExcel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleFileChangeCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChangeExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcel(file);
    }
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
      <div className="relative w-full md:w-80">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input 
          type="text" 
          className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008FD7]/10 focus:border-[#008FD7] transition-all text-sm"
          placeholder="Cari nama atau NIS santri..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <input type="file" ref={fileInputRef} onChange={handleFileChangeCSV} accept=".csv" className="hidden" />
        <input type="file" ref={excelInputRef} onChange={handleFileChangeExcel} accept=".xlsx,.xls" className="hidden" />
        
        <ActionDropdown
          label="Template"
          icon={<FileText size={16} />}
          buttonStyle={{ background: '#f8fafc', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0' }}
          items={[
            { label: 'Template CSV', icon: <FileText size={14} />, onClick: onDownloadTemplateCSV },
            { label: 'Template Excel', icon: <FileSpreadsheet size={14} />, onClick: onDownloadTemplateExcel }
          ]}
        />

        <ActionDropdown
          label="Export"
          icon={<Download size={16} />}
          buttonStyle={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600 }}
          items={[
            { label: 'Export CSV', icon: <FileText size={14} />, onClick: onExportCSV },
            { label: 'Export Excel', icon: <FileSpreadsheet size={14} />, onClick: onExportExcel }
          ]}
        />

        <ActionDropdown
          label="Import"
          icon={<Upload size={16} />}
          buttonStyle={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 600 }}
          items={[
            { label: 'Import CSV', icon: <FileText size={14} />, onClick: () => fileInputRef.current?.click() },
            { label: 'Import Excel', icon: <FileSpreadsheet size={14} />, onClick: () => excelInputRef.current?.click() }
          ]}
        />

        <button 
          className="flex items-center gap-2 bg-[#422F6F] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow w-full md:w-auto justify-center" 
          onClick={onAdd}
        >
          <UserPlus size={16} />
          Tambah Santri
        </button>
      </div>
    </div>
  );
};
