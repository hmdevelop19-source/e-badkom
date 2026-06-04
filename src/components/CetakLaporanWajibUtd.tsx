import React from 'react';

interface Props {
  laporan: any;
  kopSuratUrl?: string;
}

export const CetakLaporanWajibUtd: React.FC<Props> = ({ laporan, kopSuratUrl }) => {
  if (!laporan) return null;

  const user = laporan.user;
  const santri = user?.santri;
  // Get active UTD for this user to know the madrasah
  const utd = santri?.utds?.[0]; // Assuming first or active
  const pjutd = utd?.pjutd;

  const getAnswer = (soalId: number) => {
    const j = laporan.jawabans?.find((x: any) => x.soal_laporan_id === soalId);
    return j ? j.jawaban : '';
  };

  // Helper for inline text
  const S = ({ id, k, t }: { id: number, k: string, t: string }) => {
    const ans = getAnswer(id);
    if (!ans) {
      return <span>{t}</span>;
    }
    const isSelected = ans.toLowerCase().includes(k.toLowerCase());
    return <span style={{ textDecoration: isSelected ? 'none' : 'line-through' }}>{t}</span>;
  };

  const getSStatus = (keyword: string) => {
    if (!user?.status_tugas) return <span>{keyword}</span>;
    return <span style={{ textDecoration: user.status_tugas.toLowerCase() === keyword.toLowerCase() ? 'none' : 'line-through' }}>{keyword}</span>;
  };

  return (
    <div className="cetak-laporan-container" style={{ 
      width: '215mm', 
      minHeight: '330mm', 
      padding: '8mm 12mm', 
      background: 'white', 
      margin: '0 auto',
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '11pt',
      lineHeight: '1.25',
      color: 'black'
    }}>
      {kopSuratUrl && (
        <img src={kopSuratUrl} alt="Kop Surat" style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
      )}
      
      {!kopSuratUrl && (
        <div style={{ textAlign: 'center', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid black' }}>
          <h2 style={{ margin: 0, fontSize: '16pt' }}>SURAT LAPORAN UT-D</h2>
          <h3 style={{ margin: 0, fontSize: '14pt' }}>BADAN KOMUNIKASI YAYASAN AL-MIFTAH</h3>
          <p style={{ margin: 0, fontSize: '12pt' }}>Pondok Pesantren Miftahul Ulum Panyeppen</p>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, border: '1px solid black', padding: '3px 8px', fontSize: '9pt', width: '70px', height: '45px' }}>
          <div style={{ borderBottom: '1px solid black', textAlign: 'center', marginBottom: '3px' }}>LAPORAN KE</div>
          <div style={{ textAlign: 'center', fontSize: '12pt', fontWeight: 'bold' }}></div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <tbody>
            <tr>
              <td style={{ width: '3%', verticalAlign: 'top', fontWeight: 'bold' }}>A.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>IDENTITAS PELAPOR :</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ width: '30%' }}>1. Nama</td>
              <td>: {user?.fullname || '...................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Alamat</td>
              <td>: {santri?.desa || '.............................'}, {santri?.kecamatan || '.............................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Status tugas</td>
              <td>: {getSStatus('wajib')} / {getSStatus("tathawwu'")} / {getSStatus("qadha'")} *)</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '10px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>B.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>TEMPAT TUGAS :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Bertempat di instansi</td>
              <td>: {getAnswer(1) || pjutd?.nama_madrasah || pjutd?.yayasan || '...................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Alamat Instansi</td>
              <td>: {pjutd?.desa || '.............................'}, {pjutd?.kecamatan || '.............................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Nama Penanggung Jawab</td>
              <td>: {pjutd?.nama_pjutd || '...................................................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>C.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KEGIATAN MADRASAH :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Dimanfaatkan sebagai</td>
              <td>: <S id={2} k="Wali" t="guru wali kelas" /> / <S id={2} k="Guru Fan" t="guru fan kelas" /> / <S id={2} k="Administrasi" t="tenaga administrasi" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Kelas yang dimasuki berisi</td>
              <td>: <S id={3} k="Banin" t="Banin" /> / <S id={3} k="Banat" t="Banat" /> / <S id={3} k="Campuran" t="Campuran" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Masuk kelas setiap hari</td>
              <td>: {getAnswer(4) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Tidak masuk karena sakit</td>
              <td>: {getAnswer(5) || '.......'} kali</td>
            </tr>
            <tr>
              <td></td>
              <td>5. Tidak masuk karena pulang</td>
              <td>: {getAnswer(6) || '.......'} kali</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>D.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KEGIATAN EKSTRA :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                Pilihan Kegiatan: {getAnswer(7) || '_____________________________________'}
              </td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>E.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KOMUNIKASI ANTAR SESAMA :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Komunikasi dengan PJUT-D</td>
              <td>: <S id={8} k="Sering" t="sering" /> / <S id={8} k="Jarang" t="jarang" /> / <S id={8} k="Tidak" t="tidak pernah" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Komunikasi dengan K. Madrasah</td>
              <td>: <S id={9} k="Sering" t="sering" /> / <S id={9} k="Jarang" t="jarang" /> / <S id={9} k="Tidak" t="tidak pernah" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Komunikasi dengan guru lain</td>
              <td>: <S id={10} k="Sering" t="sering" /> / <S id={10} k="Jarang" t="jarang" /> / <S id={10} k="Tidak" t="tidak pernah" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Komunikasi dengan masyarakat</td>
              <td>: <S id={11} k="Sering" t="sering" /> / <S id={11} k="Jarang" t="jarang" /> / <S id={11} k="Tidak" t="tidak pernah" /> *)</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>F.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>BISYAROH :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Bisyaroh dari PJUT-D bulan ini</td>
              <td>: Rp. {getAnswer(12) || '.....................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Tunjangan lain</td>
              <td>: Rp. {getAnswer(13) || '.....................................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>G.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KENDALA-KENDALA :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                <div style={{ borderBottom: '1px dotted black', minHeight: '20px' }}>{getAnswer(14)}</div>
                <div style={{ borderBottom: '1px dotted black', minHeight: '20px' }}></div>
              </td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>H.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>LAIN-LAIN (Kritik & Saran) :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                <div style={{ borderBottom: '1px dotted black', minHeight: '20px' }}>{getAnswer(15)}</div>
                <div style={{ borderBottom: '1px dotted black', minHeight: '20px' }}></div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <table style={{ width: '300px' }}>
            <tbody>
              <tr>
                <td style={{ width: '100px' }}>Laporan ini ditulis di</td>
                <td>: .......................................</td>
              </tr>
              <tr>
                <td>Pada tanggal</td>
                <td>: {laporan.created_at ? new Date(laporan.created_at).toLocaleDateString('id-ID') : '.......................................'}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', paddingTop: '10px', paddingBottom: '30px' }}>Pelapor,</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>( {user?.fullname || '.......................................'} )</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '15px', fontSize: '9pt' }}>
          <strong><u>Keterangan :</u></strong>
          <ol style={{ paddingLeft: '15px', margin: '3px 0' }}>
            <li>Laporan dibuat-buat adalah dusta dan khianat</li>
            <li>Tanda *) adalah coret yang tidak perlu</li>
            <li>Bila laporan tidak cukup bisa ditambah dengan kertas lain</li>
            <li>Laporan kertas putih dikirim ke Badkom Wilayah</li>
            <li>Laporan kertas hijau sebagai arsip pribadi</li>
          </ol>
        </div>

      </div>
    </div>
  );
};
