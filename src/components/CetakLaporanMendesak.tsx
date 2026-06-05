import React from 'react';

interface Props {
  laporan: any;
  kopSuratUrl?: string;
}

export const CetakLaporanMendesak: React.FC<Props> = ({ laporan, kopSuratUrl }) => {
  if (!laporan) return null;

  const user = laporan.user;
  const level = user?.level;
  
  const namaUtd = user?.santri?.nama_lengkap || '-';
  const namaPjutd = user?.pjutd?.nama_pjutd || user?.fullname || '-';
  const namaLembaga = user?.pjutd?.nama_madrasah || user?.pjutd?.yayasan || '-';
  const alamatLembaga = user?.pjutd?.alamat || '-';
  const badkomWilayah = user?.pjutd?.badkom?.nama_badkom || user?.badkom_wilayah?.nama_badkom || '-';

  const ttdName = user?.fullname || '.........................';
  const gelarPenandatangan = level === 'utd' ? "Ustadz Tugas & Da'i" : level === 'pjutd' ? "Penanggung Jawab UT-D" : "Pengirim";

  return (
    <div className="print-only" style={{ padding: '20px 40px', fontFamily: '"Times New Roman", Times, serif', color: 'black', fontSize: '11pt', lineHeight: 1.3 }}>
      {kopSuratUrl ? (
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px double black', paddingBottom: '10px' }}>
          <img src={kopSuratUrl} alt="Kop Surat" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
        </div>
      ) : (
        <div style={{ position: 'relative', marginBottom: '20px', borderBottom: '3px double black', paddingBottom: '10px' }}>
          <div style={{ marginLeft: '90px', textAlign: 'left' }}>
            <h1 style={{ display: 'inline', fontSize: '20pt', margin: 0, color: '#000080', letterSpacing: '2px' }}>BADKOM</h1>
            <p style={{ margin: 0, fontSize: '9pt', color: '#000080' }}>Badan Komunikasi Pendidikan dan Dakwah</p>
            <p style={{ margin: 0, fontSize: '9pt', color: '#000080' }}><strong>YAYASAN AL-MIFTAH PP. Miftahul Ulum Panyeppen</strong></p>
            <div style={{ textAlign: 'right', marginTop: '-45px', fontStyle: 'italic', fontSize: '9pt' }}>
              Ustadz Tugas & Da'i Zakat<br/>
              Penanggung Jawab Ustadz Tugas & Da'i<br/>
              Madrasah Ranting<br/>
              Pendidikan & Dakwah
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', marginTop: '30px', marginBottom: '30px' }}>
        SURAT LAPORAN INSIDENTAL
      </div>

      <div style={{ textAlign: 'justify' }}>
        <p style={{ marginBottom: 0 }}>Kepada Yth.</p>
        <p style={{ fontWeight: 'bold', margin: '0' }}>Badan Komunikasi Yayasan Al-Miftah</p>
        <p style={{ fontWeight: 'bold', margin: '0' }}>PP. Miftahul Ulum Panyeppen</p>
        <p style={{ marginTop: 0 }}>di Tempat</p>

        <p style={{ textAlign: 'center', fontStyle: 'italic', margin: '15px 0' }}>Assalamu'alaikum Wr. Wb.</p>

        <p style={{ textIndent: '40px' }}>
          Dengan hormat, bersama ini kami menyampaikan laporan kejadian yang terjadi di lembaga sebagai berikut:
        </p>

        <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
          <tbody>
            {level === 'utd' ? (
              <>
                <tr><td style={{ width: '150px', padding: '3px 0', verticalAlign: 'top' }}>Nama UT-D (Santri)</td><td style={{ width: '10px', padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{namaUtd}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Nama PJ UT-D</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{namaPjutd}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Nama Lembaga</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{namaLembaga}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Badkom Wilayah</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{badkomWilayah}</td></tr>
              </>
            ) : level === 'pjutd' ? (
              <>
                <tr><td style={{ width: '150px', padding: '3px 0', verticalAlign: 'top' }}>Nama PJ UT-D</td><td style={{ width: '10px', padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{namaPjutd}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Nama Lembaga</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{namaLembaga}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Alamat Lembaga</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{alamatLembaga}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Badkom Wilayah</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{badkomWilayah}</td></tr>
              </>
            ) : level === 'badkom_wilayah' ? (
              <>
                <tr><td style={{ width: '150px', padding: '3px 0', verticalAlign: 'top' }}>Nama Koordinator</td><td style={{ width: '10px', padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{ttdName}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Badkom Wilayah</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{badkomWilayah}</td></tr>
                <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Wilayah Koordinasi</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{namaLembaga}</td></tr>
              </>
            ) : (
              <tr><td style={{ width: '150px', padding: '3px 0', verticalAlign: 'top' }}>Nama / Pengirim</td><td style={{ width: '10px', padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0' }}>{ttdName}</td></tr>
            )}
            <tr><td style={{ padding: '3px 0', verticalAlign: 'top' }}>Judul Laporan</td><td style={{ padding: '3px 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>{laporan.judul}</td></tr>
          </tbody>
        </table>

        <p>Isi Laporan:</p>
        <div style={{ marginBottom: '10px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {laporan.isi_laporan}
        </div>

        <p style={{ textIndent: '40px', marginTop: '15px' }}>
          Demikian laporan ini kami sampaikan untuk menjadi perhatian dan tindak lanjut sebagaimana mestinya. Atas perhatian dan kerja samanya kami sampaikan terima kasih.
        </p>

        <p style={{ marginBottom: 0, marginTop: '15px' }}>Wassalamu'alaikum Wr. Wb.</p>

        <div style={{ width: '100%', marginTop: '40px' }}>
          <div style={{ float: 'right', textAlign: 'center', width: '300px' }}>
            {user?.pjutd?.kabupaten || '.....................................'}, {new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/><br/>
            Hormat kami,<br/>
            {gelarPenandatangan}<br/><br/><br/><br/><br/>
            ( {ttdName} )
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      </div>
    </div>
  );
};
