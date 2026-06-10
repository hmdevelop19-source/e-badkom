export interface Santri {
  id: number;
  nis: string;
  nama: string;
  keahlian?: string;
  status_santri?: string;
  nik?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  id_prov?: number;
  id_kab?: number;
  id_kec?: number;
  id_kel?: number;
  wali_id?: number;
  wali?: {
    nik?: string;
    nama_wali: string;
    no_hp?: string;
    email?: string;
  };
  nik_wali?: string;
  nama_wali?: string;
  no_hp_wali?: string;
  email_wali?: string;
  utds?: Array<{
    id: number;
    pjutd?: {
      id: number;
      nama_pjutd: string;
      kode_lembaga: string;
      nama_madrasah?: string;
      yayasan?: string;
    };
    tahun_ajaran?: {
      id: number;
      nama_tahun_ajaran: string;
      is_active: boolean;
    };
    penilaian?: {
      id: number;
      keterangan: string;
      predikat: string;
      status_badkom_pusat: string;
    };
    mutasis?: Array<{
      id: number;
      tanggal_mutasi: string;
      alasan: string;
      asal_pjutd?: {
        nama_pjutd: string;
        nama_madrasah?: string;
        yayasan?: string;
      };
      tujuan_pjutd?: {
        nama_pjutd: string;
        nama_madrasah?: string;
        yayasan?: string;
      };
    }>;
    status: string;
    created_at: string;
  }>;
}
