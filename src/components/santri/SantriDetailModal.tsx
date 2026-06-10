import React from 'react';
import Modal from '../Modal';
import type { Santri } from '../../types/santri';

interface SantriDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSantri: Santri | null;
}

export const SantriDetailModal: React.FC<SantriDetailModalProps> = ({ isOpen, onClose, selectedSantri }) => {
  if (!selectedSantri) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail & Riwayat Penugasan Santri"
      maxWidth="800px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Cards Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Data Pribadi Card */}
          <div style={{ 
            background: '#ffffff', 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Data Pribadi</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NIS / NIK</div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>{selectedSantri.nis} / {selectedSantri.nik || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Lengkap</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: '2px' }}>{selectedSantri.nama}</div>
              </div>
              <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lahir</div>
                  <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.tempat_lahir || '-'}, {selectedSantri.tanggal_lahir ? new Date(selectedSantri.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</div>
                  <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.jenis_kelamin === 'L' ? 'Laki-laki' : selectedSantri.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keahlian Khusus</div>
                <div style={{ fontWeight: 500, color: '#0369a1', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.keahlian || '-'}</div>
              </div>
            </div>
          </div>

          {/* Kontak & Alamat Card */}
          <div style={{ 
            background: '#ffffff', 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Kontak & Wali</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Orang Tua/Wali</div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>{selectedSantri.wali?.nama_wali || '-'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIK: {selectedSantri.wali?.nik || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kontak Wali</div>
                <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>{selectedSantri.wali?.no_hp || '-'} / {selectedSantri.wali?.email || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alamat Lengkap</div>
                <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem', marginTop: '2px', lineHeight: 1.5 }}>{selectedSantri.alamat || 'Alamat belum diisi'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Penugasan Card */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden' 
        }}>
          <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Riwayat Penugasan (UTD)</h3>
          </div>
          
          {selectedSantri.utds && selectedSantri.utds.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Tahun Ajaran</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Tempat Tugas</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSantri.utds.map((utd) => (
                    <React.Fragment key={utd.id}>
                      <tr style={{ transition: 'background 0.2s', ':hover': { background: '#f8fafc' } } as any}>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                          {utd.tahun_ajaran?.nama_tahun_ajaran || '-'}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{utd.pjutd?.nama_madrasah || utd.pjutd?.yayasan || utd.pjutd?.nama_pjutd || '-'}</div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>ID: {utd.pjutd?.kode_lembaga}</div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {(() => {
                            let displayStatus = utd.status || 'Aktif';
                            if (displayStatus === 'Aktif' && utd.tahun_ajaran && !utd.tahun_ajaran.is_active) displayStatus = 'Selesai';
                            
                            const getBadgeStyle = (status: string) => {
                              switch(status) {
                                case 'Aktif': return { bg: '#f0fdfa', color: '#0f766e', border: '#ccfbf1' };
                                case 'Ditarik': return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
                                case 'Dimutasi': return { bg: '#fffbeb', color: '#b45309', border: '#fef3c7' };
                                case 'Selesai': return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
                                default: return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
                              }
                            };
                            const badgeStyle = getBadgeStyle(displayStatus);

                            return (
                              <span style={{ 
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem', 
                                fontWeight: 600,
                                background: badgeStyle.bg,
                                color: badgeStyle.color,
                                border: `1px solid ${badgeStyle.border}`
                              }}>
                                {displayStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          {utd.penilaian ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 700, color: utd.penilaian.keterangan === 'Lulus' ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                                  {utd.penilaian.keterangan}
                                </span>
                                <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #e2e8f0' }}>
                                  {utd.penilaian.predikat}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                                Pusat: {utd.penilaian.status_badkom_pusat}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 500 }}>Belum dinilai</span>
                          )}
                        </td>
                      </tr>
                      
                      {/* Mutasi History Sub-row */}
                      {utd.mutasis && utd.mutasis.length > 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px dashed #fcd34d', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-6px', top: '24px', width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', border: '3px solid #fff' }}></div>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.7rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 700, letterSpacing: '0.05em', paddingLeft: '12px' }}>Riwayat Mutasi</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px' }}>
                                {utd.mutasis.map(mutasi => (
                                  <div key={mutasi.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.8rem' }}>{new Date(mutasi.tanggal_mutasi).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                      <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{mutasi.asal_pjutd?.nama_madrasah || mutasi.asal_pjutd?.yayasan || mutasi.asal_pjutd?.nama_pjutd || '-'}</span> 
                                      <span style={{ margin: '0 8px', color: '#f59e0b' }}>&rarr;</span> 
                                      <span style={{ fontWeight: 600, color: '#047857' }}>{mutasi.tujuan_pjutd?.nama_madrasah || mutasi.tujuan_pjutd?.yayasan || mutasi.tujuan_pjutd?.nama_pjutd || '-'}</span>
                                    </div>
                                    <div style={{ color: '#78350f', fontSize: '0.75rem', fontStyle: 'italic' }}>Alasan: {mutasi.alasan}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📋</div>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Santri ini belum memiliki riwayat penugasan.</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
          <button 
            className="btn" 
            onClick={onClose} 
            style={{ 
              background: '#f1f5f9', 
              color: '#475569', 
              fontWeight: 600, 
              borderRadius: '30px', 
              padding: '10px 24px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </Modal>
  );
};
