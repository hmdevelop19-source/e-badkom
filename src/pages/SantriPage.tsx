import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from "react-hot-toast";
import api from '../api/client';
import type { Santri } from '../types/santri';
import { SantriHeader } from '../components/santri/SantriHeader';
import { SantriTable } from '../components/santri/SantriTable';
import { SantriFormModal } from '../components/santri/SantriFormModal';
import { SantriDetailModal } from '../components/santri/SantriDetailModal';

const SantriPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Modals & Mode State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Data State
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [formData, setFormData] = useState<Partial<Santri>>({ nis: '', nama: '' });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Wilayah State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  useEffect(() => {
    api.get('/wilayah/provinsi').then(res => setProvinces(res.data));
  }, []);

  useEffect(() => {
    if (formData.id_prov) {
      api.get(`/wilayah/kabupaten/${formData.id_prov}`).then(res => setRegencies(res.data));
    } else {
      setRegencies([]);
    }
  }, [formData.id_prov]);

  useEffect(() => {
    if (formData.id_kab) {
      api.get(`/wilayah/kecamatan/${formData.id_kab}`).then(res => setDistricts(res.data));
    } else {
      setDistricts([]);
    }
  }, [formData.id_kab]);

  useEffect(() => {
    if (formData.id_kec) {
      api.get(`/wilayah/kelurahan/${formData.id_kec}`).then(res => setVillages(res.data));
    } else {
      setVillages([]);
    }
  }, [formData.id_kec]);

  const { data: santris, isLoading } = useQuery<Santri[]>({
    queryKey: ['santri'],
    queryFn: async () => {
      const response = await api.get('/santri');
      return response.data;
    },
  });

  const filteredSantris = santris?.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredSantris.length / itemsPerPage);
  const paginatedSantris = filteredSantris.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const targetTugasWajib = (() => {
    const setting = settings.find((s: any) => s.key === 'target_tugas_wajib');
    return setting && !isNaN(Number(setting.value)) ? Number(setting.value) : 3;
  })();

  const mutation = useMutation({
    mutationFn: (newSantri: Partial<Santri>) => {
      if (isEditMode && newSantri.id) {
        return api.put(`/santri/${newSantri.id}`, newSantri);
      }
      return api.post('/santri', newSantri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ nis: '', nama: '' });
      setError('');
      toast.success(isEditMode ? 'Data santri berhasil diupdate' : 'Data santri berhasil ditambahkan');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleImportCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/santri/import/csv', formData);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      toast.success('Data santri berhasil diimport');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengimport data');
    }
  };

  const handleImportExcel = async (file: File) => {
    const formDataFile = new FormData();
    formDataFile.append('file', file);
    try {
      const response = await api.post('/santri/import/excel', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengimpor file Excel.');
    }
  };

  const downloadFile = (data: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/santri/export/csv', { responseType: 'blob' });
      downloadFile(response.data, 'santri_export.csv');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengekspor data.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/santri/export/excel', { responseType: 'blob' });
      downloadFile(response.data, 'santri_export.xlsx');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengekspor data Excel.');
    }
  };

  const handleDownloadTemplateCSV = async () => {
    try {
      const response = await api.get('/santri/template/csv', { responseType: 'blob' });
      downloadFile(response.data, 'santri_template.csv');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh template.');
    }
  };

  const handleDownloadTemplateExcel = async () => {
    try {
      const response = await api.get('/santri/template/excel', { responseType: 'blob' });
      downloadFile(response.data, 'santri_template.xlsx');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh template Excel.');
    }
  };

  const handleView = (id: number) => {
    api.get(`/santri/${id}`).then(res => {
      setSelectedSantri(res.data);
      setIsDetailModalOpen(true);
    }).catch(err => {
      console.error(err);
      toast.error('Gagal mengambil data detail santri.');
    });
  };

  const handleEdit = (s: Santri) => {
    setIsEditMode(true);
    setFormData({
      ...s,
      nik_wali: s.wali?.nik || '',
      nama_wali: s.wali?.nama_wali || '',
      no_hp_wali: s.wali?.no_hp || '',
      email_wali: s.wali?.email || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = (_id: number) => {
    // Ideally this would be a mutation or a confirmation modal, but mapping what was originally there (just an empty button).
    toast.error('Fitur hapus belum diimplementasikan di view awal.');
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({ nis: '', nama: '' });
    setError('');
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease]">
      <SantriHeader 

        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAdd={handleAddClick}
        onImportCSV={handleImportCSV}
        onImportExcel={handleImportExcel}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onDownloadTemplateCSV={handleDownloadTemplateCSV}
        onDownloadTemplateExcel={handleDownloadTemplateExcel}
      />

      <SantriTable 
        isLoading={isLoading}
        santris={paginatedSantris}
        totalItems={filteredSantris.length}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        targetTugasWajib={targetTugasWajib}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SantriFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditMode={isEditMode}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        error={error}
        provinces={provinces}
        regencies={regencies}
        districts={districts}
        villages={villages}
      />

      <SantriDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        selectedSantri={selectedSantri}
      />
    </div>
  );
};

export default SantriPage;
