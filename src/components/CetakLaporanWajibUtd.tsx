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
              <td style={{ width: '35%' }}>1. Nama</td>
              <td>: {user?.fullname || '...................................................'} Umur : ........... tahun</td>
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

            <tr><td colSpan={3} style={{ height: '5px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>B.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>TEMPAT TUGAS :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Bertempat di Madrasah</td>
              <td>: {pjutd?.nama_madrasah || pjutd?.yayasan || '...................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Alamat Madrasah</td>
              <td>: {pjutd?.desa || '.............................'}, {pjutd?.kecamatan || '.............................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Nama Penanggung Jawab</td>
              <td>: {pjutd?.nama_pjutd || '...................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Nama Kepala Madrasah</td>
              <td>: {pjutd?.nama_kepala_madrasah || '...................................................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>C.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KEGIATAN MADRASAH :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Dimanfaatkan sebagai guru wali kelas</td>
              <td>: <S id={2} k="1" t="1" />/<S id={2} k="2" t="2" />/<S id={2} k="3" t="3" />/<S id={2} k="4" t="4" />/<S id={2} k="5" t="5" />/<S id={2} k="6" t="6" /> *) tingkat : <S id={1} k="MI" t="MI" /> / <S id={1} k="MTs" t="MTs" /> / <S id={1} k="MA" t="MA" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Dimanfaatkan sebagai guru fan kelas</td>
              <td>: <S id={4} k="1" t="1" />/<S id={4} k="2" t="2" />/<S id={4} k="3" t="3" />/<S id={4} k="4" t="4" />/<S id={4} k="5" t="5" />/<S id={4} k="6" t="6" /> *) tingkat : <S id={3} k="MI" t="MI" /> / <S id={3} k="MTs" t="MTs" /> / <S id={3} k="MA" t="MA" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Kelas yang dimasuki berisi murid</td>
              <td>: <S id={5} k="Banin" t="Banin" /> / <S id={5} k="Banat" t="Banat" /> / <S id={5} k="Campuran" t="Campuran" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Bulan ini masuk kelas sebanyak</td>
              <td>: {getAnswer(6) || '.......'} hari = {getAnswer(7) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>5. Tidak masuk kelas karena sakit</td>
              <td>: {getAnswer(8) || '.......'} hari = {getAnswer(9) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>6. Tidak masuk kelas karena pulang</td>
              <td>: {getAnswer(10) || '.......'} hari = {getAnswer(11) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>7. Tidak masuk kelas karena udzur lain</td>
              <td>: {getAnswer(12) || '.......'} hari = {getAnswer(13) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>8. Jumlah tidak masuk selama satu bulan</td>
              <td>: {getAnswer(14) || '.......'} hari = {getAnswer(15) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>9. Jumlah jam wajib mengajar bulan ini</td>
              <td>: {getAnswer(16) || '.......'} hari = {getAnswer(17) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td>10. Jumlah jam wajib mengajar sepekan</td>
              <td>: {getAnswer(18) || '.......'} hari = {getAnswer(19) || '.......'} jam pelajaran</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>11. Menangani administrasi sekolah berupa :</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ paddingLeft: '15px' }}>a. Absensi murid</td>
              <td>: <S id={20} k="Ikut" t="ikut" /> / <S id={20} k="Tidak ikut" t="tidak ikut" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ paddingLeft: '15px' }}>b. Buku raport</td>
              <td>: <S id={21} k="Ikut" t="ikut" /> / <S id={21} k="Tidak ikut" t="tidak ikut" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ paddingLeft: '15px' }}>c. Buku tabungan</td>
              <td>: <S id={22} k="Ikut" t="ikut" /> / <S id={22} k="Tidak ikut" t="tidak ikut" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ paddingLeft: '15px' }}>d. {getAnswer(23) ? getAnswer(23).split('-')[0] || getAnswer(23) : '.........................................'}</td>
              <td>: <S id={23} k="Ikut" t="ikut" /> / <S id={23} k="Tidak ikut" t="tidak ikut" /> *)</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>D.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KEGIATAN EKSTRA :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Mengajar Al-Qur'an bil-tartil</td>
              <td>: <S id={24} k="Ya" t="ya" /> / <S id={24} k="Tidak" t="tidak" /> *) ........... jam (<S id={25} k="Pagi" t="pagi" />/ <S id={25} k="Siang" t="siang" />/ <S id={25} k="Malam" t="malam" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Mengajar kitab</td>
              <td>: <S id={26} k="Ya" t="ya" /> / <S id={26} k="Tidak" t="tidak" /> *) ........... jam (<S id={27} k="Pagi" t="pagi" />/ <S id={27} k="Siang" t="siang" />/ <S id={27} k="Malam" t="malam" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Ditunjuk sebagai imam rowatib</td>
              <td>: <S id={28} k="Ya" t="ya" /> / <S id={28} k="Tidak" t="tidak" /> *) di <S id={29} k="Masjid" t="Masjid" /> / <S id={29} k="Musholla" t="Musholla" /> / <S id={29} k="Surau" t="Surau" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. {getAnswer(30) || '...................................................'}</td>
              <td>: </td>
            </tr>
            <tr>
              <td></td>
              <td>5. {getAnswer(31) || '...................................................'}</td>
              <td>: </td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>E.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KOMUNIKASI ANTAR SESAMA :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Komunikasi dengan PJUT-D</td>
              <td>: <S id={32} k="Sering" t="sering" /> / <S id={32} k="Jarang" t="jarang" /> / <S id={32} k="Tidak pernah" t="tidak pernah" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Komunikasi dengan Kepala Madrasah</td>
              <td>: <S id={33} k="Sering" t="sering" /> / <S id={33} k="Jarang" t="jarang" /> / <S id={33} k="Tidak pernah" t="tidak pernah" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Komunikasi dengan guru yang lain</td>
              <td>: <S id={34} k="Sering" t="sering" /> / <S id={34} k="Jarang" t="jarang" /> / <S id={34} k="Tidak pernah" t="tidak pernah" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Komunikasi dengan masyrakat umum</td>
              <td>: <S id={35} k="Sering" t="sering" /> / <S id={35} k="Jarang" t="jarang" /> / <S id={35} k="Tidak pernah" t="tidak pernah" /> *)</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>F.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>BISYAROH :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Bisyaroh dari PJUT-D bulan ini</td>
              <td>: Rp. {getAnswer(36) || '.....................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Tunjangan lain</td>
              <td>: Rp. {getAnswer(37) || '.....................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. {getAnswer(38) ? getAnswer(38).split('-')[0] : '.....................................'}</td>
              <td>: Rp. {getAnswer(38) ? getAnswer(38).split('-')[1] || '' : '.....................................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>G.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KENDALA-KENDALA :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                1. {getAnswer(39) ? getAnswer(39).split('\n')[0] : '......................................................................................................'}<br/>
                2. {getAnswer(39) ? getAnswer(39).split('\n')[1] || '......................................................................................................' : '......................................................................................................'}<br/>
                3. {getAnswer(39) ? getAnswer(39).split('\n')[2] || '......................................................................................................' : '......................................................................................................'}
              </td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>H.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>LAIN-LAIN :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                1. {getAnswer(40) ? getAnswer(40).split('\n')[0] : '......................................................................................................'}<br/>
                2. {getAnswer(40) ? getAnswer(40).split('\n')[1] || '......................................................................................................' : '......................................................................................................'}<br/>
                3. {getAnswer(40) ? getAnswer(40).split('\n')[2] || '......................................................................................................' : '......................................................................................................'}
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
                <td>Hari & Tanggal</td>
                <td>: {laporan.created_at ? new Date(laporan.created_at).toLocaleDateString('id-ID') : '.......................................'}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', paddingTop: '10px', paddingBottom: '30px' }}>Pelapor</td>
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
            <li>Bila laporan tidak cukup bias ditambah dengan kertas lain</li>
            <li>Laporan kertas putih dikirim ke Badkom Wilayah</li>
            <li>Laporan kertas hijau sebagai arsip pribadi</li>
          </ol>
        </div>

      </div>
    </div>
  );
};
