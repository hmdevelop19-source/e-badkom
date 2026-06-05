import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, History, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const RiwayatUtdPage: React.FC = () => {
  const [riwayatList, setRiwayatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/riwayat-utd', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRiwayatList(response.data);
    } catch (error) {
      console.error('Error fetching riwayat utd:', error);
      toast.error('Gagal mengambil data riwayat UT-D');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const filteredRiwayat = riwayatList.filter((r) =>
    r.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="header-actions" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Riwayat UT-D</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Daftar Ustadz Tugas & Da'i yang pernah ditugaskan di lembaga Anda.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
            <input 
              type="text" 
              placeholder="Cari nama UT-D..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Memuat data riwayat...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredRiwayat.length > 0 ? (
              filteredRiwayat.map((utd) => (
                <div key={utd.id} style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    padding: '6px 12px', 
                    background: utd.status?.toLowerCase() === 'dimutasi' ? '#fefce8' : (utd.status?.toLowerCase() === 'ditarik' ? '#fef2f2' : '#f0fdf4'),
                    color: utd.status?.toLowerCase() === 'dimutasi' ? '#854d0e' : (utd.status?.toLowerCase() === 'ditarik' ? '#991b1b' : '#166534'),
                    borderBottomLeftRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {utd.status}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      background: '#f1f5f9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      <History size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{utd.nama}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>TA: {utd.tahun_ajaran}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <MapPin size={16} />
                    <span>{utd.desa ? `${utd.desa}, ${utd.kecamatan}` : 'Alamat tidak diketahui'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <Users size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                <p>Tidak ada riwayat UT-D yang ditemukan.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatUtdPage;
