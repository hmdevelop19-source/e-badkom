import React from 'react';
import logoBadkom from '../../assets/LOGOBADKOM.png';

const Footer: React.FC = () => {
  return (
    <>
      <style>{`
        .footer-enhanced {
          background: linear-gradient(to right, #f8fafc, #ffffff, #f8fafc);
          padding: 24px 40px;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
      `}</style>
      <footer className="footer-enhanced">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#475569' }}>
          <img src={logoBadkom} alt="Logo" style={{ width: '16px', height: '16px', opacity: 0.6 }} />
          E-Badkom &copy; {new Date().getFullYear()}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Sistem Informasi Manajemen Tugas & Evaluasi. Hak Cipta Dilindungi.
        </div>
      </footer>
    </>
  );
};

export default Footer;
