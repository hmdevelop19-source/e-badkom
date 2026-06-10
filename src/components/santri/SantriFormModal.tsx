import React from 'react';
import toast from 'react-hot-toast';
import Modal from '../Modal';
import type { Santri } from '../../types/santri';
import api from '../../api/client';

interface SantriFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  formData: Partial<Santri>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Santri>>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string;
  provinces: any[];
  regencies: any[];
  districts: any[];
  villages: any[];
}

export const SantriFormModal: React.FC<SantriFormModalProps> = ({
  isOpen,
  onClose,
  isEditMode,
  formData,
  setFormData,
  onSubmit,
  isPending,
  error,
  provinces,
  regencies,
  districts,
  villages
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Data Santri" : "Tambah Santri Baru"}
      maxWidth="750px"
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Section: Kontak & Wali */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Data Wali & Kontak</h3>

          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">NIK WALI (Untuk Auto-fill)</label>
              <input
                type="text"
                placeholder="16 Digit NIK Wali"
                value={formData.nik_wali || ''}
                maxLength={16}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, nik_wali: val }));
                  if (val.length === 16) {
                    api.get(`/wali/by-nik/${val}`).then(res => {
                      if (res.data.status) {
                        setFormData(prev => ({
                          ...prev,
                          nama_wali: res.data.data.nama_wali,
                          no_hp_wali: res.data.data.no_hp,
                          email_wali: res.data.data.email
                        }));
                        toast.success('Data Wali berhasil ditemukan dan diisi otomatis.');
                      }
                    }).catch(err => console.error(err));
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">NAMA ORANG TUA / WALI *</label>
              <input
                type="text"
                placeholder="Nama Lengkap Wali"
                value={formData.nama_wali || ''}
                onChange={(e) => setFormData({ ...formData, nama_wali: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">NOMOR HP / WHATSAPP WALI</label>
              <input
                type="text"
                placeholder="Mulai dengan 62xxx"
                value={formData.no_hp_wali || ''}
                onChange={(e) => setFormData({ ...formData, no_hp_wali: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">ALAMAT EMAIL WALI</label>
              <input
                type="email"
                placeholder="email@contoh.com"
                value={formData.email_wali || ''}
                onChange={(e) => setFormData({ ...formData, email_wali: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section: Data Pribadi */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Data Pribadi Santri</h3>

          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">NOMOR INDUK SANTRI (NIS) *</label>
              <input
                type="text"
                placeholder="Masukkan NIS"
                value={formData.nis || ''}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">NOMOR INDUK KEPENDUDUKAN (NIK)</label>
              <input
                type="text"
                placeholder="16 Digit NIK (Auto-fill)"
                value={formData.nik || ''}
                maxLength={16}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, nik: val }));
                  if (val.length === 16) {
                    api.get(`/wilayah/parse-nik/${val}`).then(res => {
                      if (res.data.status) {
                        setFormData(prev => ({ ...prev, ...res.data.data }));
                      }
                    }).catch(err => console.error(err));
                  }
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label className="form-label">NAMA LENGKAP SANTRI *</label>
            <input
              type="text"
              placeholder="Nama Lengkap Sesuai Dokumen"
              value={formData.nama || ''}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">JENIS KELAMIN</label>
              <select
                value={formData.jenis_kelamin || ''}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
              >
                <option value="">-- Pilih --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">TEMPAT LAHIR</label>
              <input
                type="text"
                placeholder="Kota/Kabupaten"
                value={formData.tempat_lahir || ''}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">TANGGAL LAHIR</label>
              <input
                type="date"
                value={formData.tanggal_lahir || ''}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
            <label className="form-label">KEAHLIAN KHUSUS (OPSIONAL)</label>
            <input
              type="text"
              placeholder="Contoh: Qori, Kaligrafi, Bahasa Arab, dll"
              value={formData.keahlian || ''}
              onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
            />
          </div>
        </div>

        {/* Section: Alamat Lengkap */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Alamat Lengkap</h3>

          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">PROVINSI</label>
              <select value={formData.id_prov || ''} onChange={(e) => setFormData({ ...formData, id_prov: Number(e.target.value), id_kab: undefined, id_kec: undefined, id_kel: undefined })}>
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">KABUPATEN / KOTA</label>
              <select value={formData.id_kab || ''} onChange={(e) => setFormData({ ...formData, id_kab: Number(e.target.value), id_kec: undefined, id_kel: undefined })}>
                <option value="">-- Pilih Kabupaten --</option>
                {regencies.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">KECAMATAN</label>
              <select value={formData.id_kec || ''} onChange={(e) => setFormData({ ...formData, id_kec: Number(e.target.value), id_kel: undefined })}>
                <option value="">-- Pilih Kecamatan --</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">KELURAHAN / DESA</label>
              <select value={formData.id_kel || ''} onChange={(e) => setFormData({ ...formData, id_kel: Number(e.target.value) })}>
                <option value="">-- Pilih Kelurahan --</option>
                {villages.map(v => <option key={v.id} value={v.id}>{v.nama}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="form-label">DETAIL ALAMAT (JALAN/RT/RW)</label>
            <textarea
              placeholder="Contoh: Jl. Merdeka No. 12, RT 01 / RW 02"
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <div style={{ marginTop: '8px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
            style={{ padding: '10px 24px' }}
          >
            {isPending ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
