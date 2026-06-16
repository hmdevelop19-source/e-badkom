import React from 'react';

interface Props {
  laporan: any;
  kopSuratUrl?: string;
  blankoKategoriList?: any[];
}

export const CetakLaporanWajibPjutd: React.FC<Props> = ({ laporan, kopSuratUrl, blankoKategoriList }) => {
  if (!laporan) return null;

  const user = laporan.user;
  const pjutd = user?.pjutd;

  // Group jawabans by KategoriSoal
  const categoriesMap = new Map<number, any>();
  
  if (laporan.jawabans && laporan.jawabans.length > 0) {
    laporan.jawabans.forEach((j: any) => {
      const soal = j.soal_laporan;
      if (!soal) return;
      
      const kat = soal.kategori_soal || { id: 0, nama_kategori: 'Lainnya', urutan: 999 };
      
      if (!categoriesMap.has(kat.id)) {
        categoriesMap.set(kat.id, { ...kat, jawabans: [] });
      }
      categoriesMap.get(kat.id).jawabans.push({
        ...j,
        soal_urutan: soal.urutan || 0,
        soal_id: soal.id
      });
    });
  } else if (blankoKategoriList && blankoKategoriList.length > 0) {
    blankoKategoriList.forEach(kat => {
      categoriesMap.set(kat.id, {
        ...kat,
        jawabans: (kat.soal_laporan || []).map((soal: any) => {
          let blankoJawaban = '..............................................................';
          if (soal.tipe_soal === 'uraian_multi' && Array.isArray(soal.opsi_jawaban)) {
            blankoJawaban = soal.opsi_jawaban.map((o: any) => `${o}: ........................`).join(' | ');
          } else if (soal.tipe_soal === 'pilihan_ganda_multi' && Array.isArray(soal.opsi_jawaban)) {
            blankoJawaban = soal.opsi_jawaban.map((g: any) => `${g.label}: ........................`).join(' | ');
          }
          return {
            soal_laporan: soal,
            jawaban: blankoJawaban,
            soal_urutan: soal.urutan || 0,
            soal_id: soal.id
          };
        })
      });
    });
  }

  const sortedCategories = Array.from(categoriesMap.values()).sort((a, b) => a.urutan - b.urutan);
  sortedCategories.forEach(cat => {
    cat.jawabans.sort((a: any, b: any) => {
      if (a.soal_urutan !== b.soal_urutan) return a.soal_urutan - b.soal_urutan;
      return a.soal_id - b.soal_id;
    });
  });

  return (
    <div className="cetak-laporan-container" style={{ 
      width: '215mm', 
      minHeight: '330mm', 
      padding: '8mm 12mm', 
      background: 'white', 
      margin: '0 auto',
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: 'black'
    }}>
      {kopSuratUrl && (
        <img src={kopSuratUrl} alt="Kop Surat" style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
      )}
      
      {!kopSuratUrl && (
        <div style={{ textAlign: 'center', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid black' }}>
          <h2 style={{ margin: 0, fontSize: '16pt' }}>SURAT LAPORAN PJUT-D</h2>
          <h3 style={{ margin: 0, fontSize: '14pt' }}>BADAN KOMUNIKASI YAYASAN AL-MIFTAH</h3>
          <p style={{ margin: 0, fontSize: '12pt' }}>Pondok Pesantren Miftahul Ulum Panyeppen</p>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, border: '1px solid black', padding: '4px 12px', fontSize: '9pt', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ borderBottom: '1px solid black', textAlign: 'center', marginBottom: '4px', paddingBottom: '2px', width: '100%' }}>LAPORAN</div>
          <div style={{ textAlign: 'center', fontSize: '9pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{laporan.kategori_bulan}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', paddingBottom: '8px', fontSize: '12pt' }}>IDENTITAS PELAPOR</td>
            </tr>
            <tr>
              <td style={{ width: '5%' }}></td>
              <td style={{ width: '35%' }}>1. Nama PJUT-D</td>
              <td>: {pjutd?.nama_pjutd || '..............................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Alamat</td>
              <td>: {pjutd?.alamat || '..............................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Nama Madrasah</td>
              <td>: {pjutd?.nama_madrasah || pjutd?.yayasan || '..............................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>4. UT-D yang ditugaskan</td>
              <td>: {pjutd?.utds?.filter((u: any) => u.status?.toLowerCase() === 'aktif')?.length > 0 ? pjutd.utds.filter((u: any) => u.status?.toLowerCase() === 'aktif').map((u: any) => u.santri?.nama).filter(Boolean).join(', ') : '..............................................................'}</td>
            </tr>
          </tbody>
        </table>

        {/* Dynamic Questions */}
        {sortedCategories.map((kategori, kIndex) => (
          <div key={kategori.id} style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12pt', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
              {String.fromCharCode(65 + kIndex)}. {kategori.nama_kategori.toUpperCase()}
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {kategori.jawabans.map((j: any, jIndex: number) => (
                  <tr key={j.id}>
                    <td style={{ width: '3%', verticalAlign: 'top', paddingBottom: '8px' }}>{jIndex + 1}.</td>
                    <td style={{ width: 'auto', verticalAlign: 'top', paddingBottom: '8px', paddingRight: '8px', whiteSpace: 'nowrap' }}>
                      {j.soal_laporan?.pertanyaan}
                    </td>
                    <td style={{ width: '100%', verticalAlign: 'top', paddingBottom: '8px', fontWeight: 'bold' }}>
                      : {j.jawaban || '-'}
                    </td>
                  </tr>
                ))}
                {kategori.jawabans.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ fontStyle: 'italic', paddingBottom: '8px' }}>Belum ada data untuk kategori ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        {/* Tanda Tangan */}
        <table style={{ width: '100%', marginTop: '30px', textAlign: 'center' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%' }}></td>
              <td style={{ width: '34%' }}></td>
              <td style={{ width: '33%' }}>
                {pjutd?.kecamatan || '...................'}, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                <br /><br /><br /><br /><br />
                <strong>({pjutd?.nama_pjutd || '...................................'})</strong>
                <br />PJUT-D
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
};
