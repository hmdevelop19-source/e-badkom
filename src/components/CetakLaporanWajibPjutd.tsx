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

  const checkAns = (soalId: number, keyword: string) => {
    return getAnswer(soalId).toLowerCase().includes(keyword.toLowerCase());
  };

  // Helper for inline text
  const S = ({ c, t }: { c: boolean, t: string }) => (
    <span style={{ textDecoration: c ? 'line-through' : 'none' }}>{t}</span>
  );

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
              <td>: {pjutd?.nama_pjutd || '..............................................................'}</td>
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
              <td>: MI / MTs / MA di kelas: 1/2/3/4/5/6 *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Dimanfaatkan menjadi guru fan kelas</td>
              <td>: MI / MTs / MA di kelas: 1/2/3/4/5/6 *)</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Dimanfaatkan mengajar murid</td>
              <td>: Banin / Banat / Campuran *)</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Ustadz Tugas & Da'i (UT-D) masuk kelas</td>
              <td>: Rajin / Jarang / tidak aktif *)</td>
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
                {[1, 2, 3].map((num) => (
                  <tr key={num}>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{num}</td>
                    <td style={{ border: '1px solid black', padding: '4px' }}>{num === 1 ? getAnswer(22) : ''}</td>
                    <td style={{ border: '1px solid black', padding: '4px' }}></td>
                    <td style={{ border: '1px solid black', padding: '4px' }}>Baru / Meneruskan *)</td>
                  </tr>
                ))}
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
              <td>: Pendek / melebihi batas *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Sampai laporan ini, UT-D pernah bepergian sebanyak</td>
              <td>: ...... Kali = ...... hari</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Sampai laporan ini, UT-D pernah pulang sebanyak</td>
              <td>: {getAnswer(21) || '......'} Kali = ...... hari</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Keperluan UT-D saat pulang</td>
              <td>: .............................................</td>
            </tr>
            <tr>
              <td></td>
              <td>5. Pernah melakukan pelanggaran berupa</td>
              <td>: .............................................</td>
            </tr>
            <tr>
              <td></td>
              <td>6. Dalam menanggulangi pelanggaran tersebut kami mengambil langkah</td>
              <td>: .............................................</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                7. Sampai laporan ini ditulis, surat idzin dari pengurus YALMI yang dipakai sebanyak: ...... lembar.<br/>
                Sisa sebanyak: ...... lembar.
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
              <td>: Baik / kurangbaik *)</td>
            </tr>
            <tr>
              <td></td>
              <td>2. Hubungan dengan kami (Penanggung Jawab UT-D)</td>
              <td>: {getAnswer(23) ? 'Baik / kurangbaik *)' : 'Baik / kurangbaik *)'}</td>
            </tr>
            <tr>
              <td></td>
              <td>3. Hubungan dengan Kepala Madrasah</td>
              <td>: {getAnswer(24) ? 'Baik / kurangbaik *)' : 'Baik / kurangbaik *)'}</td>
            </tr>
            <tr>
              <td></td>
              <td>4. Hubungan murid dengan Ustadz tugas & Da'i (UT-D)</td>
              <td>: Baik / kurangbaik *)</td>
            </tr>
            <tr>
              <td></td>
              <td>5. Hubungan dengan murid didalam kelas</td>
              <td>: Akrab / kurang *)</td>
            </tr>
            <tr>
              <td></td>
              <td>6. Hubungan dengan murid diluar kelas</td>
              <td>: Akrab / kurang *)</td>
            </tr>
            <tr>
              <td></td>
              <td>7. Bisyaroh 1 bulan kepada UT-D sebesar</td>
              <td>: Rp. {getAnswer(27) || '.............................'}</td>
            </tr>

            <tr><td colSpan={3} style={{ height: '4px' }}></td></tr>

            <tr>
              <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>G.</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>LAIN-LAIN YANG DIPANDANG PERLU UNTUK DIKETAHUI :</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={2}>
                <div style={{ borderBottom: '1px dotted black', minHeight: '15px' }}>{getAnswer(29) || getAnswer(30)}</div>
                <div style={{ borderBottom: '1px dotted black', minHeight: '15px' }}></div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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

        <div style={{ marginTop: '10px', fontSize: '8.5pt' }}>
          <strong><u>Keterangan :</u></strong>
          <ol style={{ paddingLeft: '15px', margin: '3px 0' }}>
            <li>Laporan yang dibuat-buat adalah dusta dan khianat</li>
            <li>Tanda *) adalah coret yang tidak perlu</li>
            <li>Bila tidak cukup bisa ditambah dikertas lain</li>
            <li>Laporan kertas putih dikirim kepengurus BADKOM Wilayah</li>
            <li>Laporan kertas hijau arsip pribadi</li>
          </ol>
        </div>

      </div>
    </div>
  );
};
