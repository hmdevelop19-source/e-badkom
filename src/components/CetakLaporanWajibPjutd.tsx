import React from 'react';

interface Props {
  laporan: any;
  kopSuratUrl?: string;
}

export const CetakLaporanWajibPjutd: React.FC<Props> = ({ laporan, kopSuratUrl }) => {
  if (!laporan) return null;

  const user = laporan.user;
  const pjutd = user?.pjutd;

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

  return (
    <div className="cetak-laporan-container" style={{ 
      width: '215mm', 
      minHeight: '330mm', 
      padding: '8mm 12mm', 
      background: 'white', 
      margin: '0 auto',
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '10pt',
      lineHeight: '1.25',
      color: 'black'
    }}>
      {kopSuratUrl && (
        <img src={kopSuratUrl} alt="Kop Surat" style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
      )}
      
      {!kopSuratUrl && (
        <div style={{ textAlign: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid black' }}>
          <h2 style={{ margin: 0, fontSize: '14pt' }}>SURAT LAPORAN PJUT-D</h2>
          <h3 style={{ margin: 0, fontSize: '12pt' }}>BADAN KOMUNIKASI YAYASAN AL-MIFTAH</h3>
          <p style={{ margin: 0, fontSize: '11pt' }}>Pondok Pesantren Miftahul Ulum Panyeppen</p>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, border: '1px solid black', padding: '3px 8px', fontSize: '9pt', width: '70px', height: '45px' }}>
          <div style={{ borderBottom: '1px solid black', textAlign: 'center', marginBottom: '3px' }}>LAPORAN KE</div>
          <div style={{ textAlign: 'center', fontSize: '11pt', fontWeight: 'bold' }}></div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <tbody>
            <tr>
              <td style={{ width: '3%', verticalAlign: 'top', fontWeight: 'bold' }}>A.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>IDENTITAS PELAPOR :</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ width: '40%' }}>1. Nama PJUT-D</td>
              <td>: {pjutd?.nama_pjutd || '..............................................................'} Umur: ...... tahun</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Alamat</td>
              <td>: {pjutd?.desa || '.............................'}, {pjutd?.kecamatan || '.............................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Nama Madrasah</td>
              <td>: {pjutd?.nama_madrasah || pjutd?.yayasan || '..............................................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Alamat Madrasah</td>
              <td>: {pjutd?.desa || '.............................'}, {pjutd?.kecamatan || '.............................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '8px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>B.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>USTADZ TUGAS & DA'I (UT-D) :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Nama</td>
              <td>: ..............................................................</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Alamat Rumah</td>
              <td>: ..............................................................</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>C.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KEGIATAN USTADZ TUGAS & DA'I (UT-D) DI RUANG KELAS :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Dimanfaatkan menjadi guru wali kelas</td>
              <td>: <S id={41} k="MI" t="MI" /> / <S id={41} k="MTs" t="MTs" /> / <S id={41} k="MA" t="MA" /> di kelas: <S id={42} k="1" t="1" />/<S id={42} k="2" t="2" />/<S id={42} k="3" t="3" />/<S id={42} k="4" t="4" />/<S id={42} k="5" t="5" />/<S id={42} k="6" t="6" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Dimanfaatkan menjadi guru fan kelas</td>
              <td>: <S id={43} k="MI" t="MI" /> / <S id={43} k="MTs" t="MTs" /> / <S id={43} k="MA" t="MA" /> di kelas: <S id={44} k="1" t="1" />/<S id={44} k="2" t="2" />/<S id={44} k="3" t="3" />/<S id={44} k="4" t="4" />/<S id={44} k="5" t="5" />/<S id={44} k="6" t="6" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Dimanfaatkan mengajar murid</td>
              <td>: <S id={45} k="Banin" t="Banin" /> / <S id={45} k="Banat" t="Banat" /> / <S id={45} k="Campuran" t="Campuran" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Ustadz Tugas & Da'i (UT-D) masuk kelas</td>
              <td>: <S id={46} k="Rajin" t="Rajin" /> / <S id={46} k="Jarang" t="Jarang" /> / <S id={46} k="Tidak aktif" t="tidak aktif" /> *)</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>
          </tbody>
        </table>

        {/* Section D: Table */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '3%', fontWeight: 'bold' }}>D.</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>KEGIATAN USTADZ TUGAS & DA'I (UT-D) DI LUAR KELAS :</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid black', padding: '4px', width: '10%' }}>NO</th>
                  <th style={{ border: '1px solid black', padding: '4px' }}>JENIS KEGIATAN</th>
                  <th style={{ border: '1px solid black', padding: '4px', width: '20%' }}>WAKTU</th>
                  <th style={{ border: '1px solid black', padding: '4px', width: '30%' }}>SIFAT KEGIATAN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{getAnswer(47)}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{getAnswer(48)}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}><S id={49} k="Baru" t="Baru" /> / <S id={49} k="Meneruskan" t="Meneruskan" /> *)</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>2</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{getAnswer(50)}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{getAnswer(51)}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}><S id={52} k="Baru" t="Baru" /> / <S id={52} k="Meneruskan" t="Meneruskan" /> *)</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>3</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{getAnswer(53)}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{getAnswer(54)}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}><S id={55} k="Baru" t="Baru" /> / <S id={55} k="Meneruskan" t="Meneruskan" /> *)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <tbody>
            <tr>
              <td style={{ width: '3%', verticalAlign: 'top', fontWeight: 'bold' }}>E.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>KETERTIBAN :</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ width: '45%' }}>1. Waktu menulis laporan ini, keadaan rambut UT-D</td>
              <td>: <S id={56} k="Pendek" t="Pendek" /> / <S id={56} k="Melebihi batas" t="melebihi batas" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Sampai laporan ini, UT-D pernah bepergian sebanyak</td>
              <td>: {getAnswer(57) || '......'} Kali = {getAnswer(58) || '......'} hari</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Sampai laporan ini, UT-D pernah pulang sebanyak</td>
              <td>: {getAnswer(59) || '......'} Kali = {getAnswer(60) || '......'} hari</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Keperluan UT-D saat pulang</td>
              <td>: {getAnswer(61) || '.............................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>5. Pernah melakukan pelanggaran berupa</td>
              <td>: {getAnswer(62) || '.............................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td>6. Dalam menanggulangi pelanggaran tersebut kami mengambil langkah</td>
              <td>: {getAnswer(63) || '.............................................'}</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                7. Sampai laporan ini ditulis, surat idzin dari pengurus YALMI yang dipakai sebanyak: {getAnswer(64) || '......'} lembar.<br/>
                Sisa sebanyak: {getAnswer(65) || '......'} lembar.
              </td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>F.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>HUBUNGAN USTADZ TUGAS & DA'I :</td>
            </tr>
            <tr>
              <td></td>
              <td>1. Hubungan dengan guru-guru yang lain</td>
              <td>: <S id={66} k="Baik" t="Baik" /> / <S id={66} k="Kurang baik" t="kurang baik" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Hubungan dengan kami (Penanggung Jawab UT-D)</td>
              <td>: <S id={67} k="Baik" t="Baik" /> / <S id={67} k="Kurang baik" t="kurang baik" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Hubungan dengan Kepala Madrasah</td>
              <td>: <S id={68} k="Baik" t="Baik" /> / <S id={68} k="Kurang baik" t="kurang baik" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Hubungan murid dengan Ustadz tugas & Da'i (UT-D)</td>
              <td>: <S id={69} k="Baik" t="Baik" /> / <S id={69} k="Kurang baik" t="kurang baik" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>5. Hubungan dengan murid didalam kelas</td>
              <td>: <S id={70} k="Akrab" t="Akrab" /> / <S id={70} k="Kurang" t="kurang" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>6. Hubungan dengan murid diluar kelas</td>
              <td>: <S id={71} k="Akrab" t="Akrab" /> / <S id={71} k="Kurang" t="kurang" /> *)</td>
            </tr>
            <tr>
              <td></td>
              <td>7. Bisyaroh 1 bulan kepada UT-D sebesar</td>
              <td>: Rp. {getAnswer(72) || '.............................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>G.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>LAIN-LAIN YANG DIPANDANG PERLU UNTUK DIKETAHUI :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                1. {getAnswer(73) ? getAnswer(73).split('\n')[0] : '......................................................................................................'}<br/>
                2. {getAnswer(73) ? getAnswer(73).split('\n')[1] || '......................................................................................................' : '......................................................................................................'}<br/>
                3. {getAnswer(73) ? getAnswer(73).split('\n')[2] || '......................................................................................................' : '......................................................................................................'}
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
                <td colSpan={2} style={{ textAlign: 'center' }}>( {pjutd?.nama_pjutd || '.......................................'} )</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '15px', fontSize: '9pt' }}>
          <strong><u>Keterangan :</u></strong>
          <ol style={{ paddingLeft: '15px', margin: '3px 0' }}>
            <li>Laporan yang dibuat-buat adalah dusta dan khianat</li>
            <li>Tanda *) adalah coret yang tidak perlu</li>
            <li>Bila laporan tidak cukup bisa ditambah dengan kertas lain</li>
            <li>Laporan kertas putih dikirim kepengurus BADKOM Wilayah</li>
            <li>Laporan kertas hijau sebagai arsip pribadi</li>
          </ol>
        </div>

      </div>
    </div>
  );
};
