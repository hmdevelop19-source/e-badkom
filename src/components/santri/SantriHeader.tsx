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
    <div className="page-header">
      <div className="search-container">
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '10px', color: '#94a3b8' }} />
        <input 
          type="text" 
          className="search-input"
          placeholder="Cari nama atau NIS santri..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="action-buttons">
        <input type="file" ref={fileInputRef} onChange={handleFileChangeCSV} accept=".csv" style={{ display: 'none' }} />
        <input type="file" ref={excelInputRef} onChange={handleFileChangeExcel} accept=".xlsx,.xls" style={{ display: 'none' }} />
        
        <ActionDropdown
          label="Template"
          icon={<FileText size={18} />}
          buttonStyle={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #cbd5e1' }}
          items={[
            { label: 'Template CSV', icon: <FileText size={16} />, onClick: onDownloadTemplateCSV },
            { label: 'Template Excel', icon: <FileSpreadsheet size={16} />, onClick: onDownloadTemplateExcel }
          ]}
        />

        <ActionDropdown
          label="Export"
          icon={<Download size={18} />}
          buttonStyle={{ background: '#f8fafc', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600 }}
          items={[
            { label: 'Export CSV', icon: <FileText size={16} />, onClick: onExportCSV },
            { label: 'Export Excel', icon: <FileSpreadsheet size={16} />, onClick: onExportExcel }
          ]}
        />

        <ActionDropdown
          label="Import"
          icon={<Upload size={18} />}
          buttonStyle={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 600 }}
          items={[
            { label: 'Import CSV', icon: <FileText size={16} />, onClick: () => fileInputRef.current?.click() },
            { label: 'Import Excel', icon: <FileSpreadsheet size={16} />, onClick: () => excelInputRef.current?.click() }
          ]}
        />

        <button className="btn btn-primary" onClick={onAdd} style={{ borderRadius: '30px', padding: '10px 24px', boxShadow: '0 4px 12px rgba(66, 47, 111, 0.2)' }}>
          <UserPlus size={18} />
          Tambah Santri
        </button>
      </div>
    </div>
  );
};
