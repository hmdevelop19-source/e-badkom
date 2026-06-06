import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal';

interface AutoLogoutProps {
  onLogout: () => void;
}

const AutoLogout: React.FC<AutoLogoutProps> = ({ onLogout }) => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const showLogoutWarningRef = useRef(false);
  const [logoutCountdown, setLogoutCountdown] = useState(60);
  const [logoutReason, setLogoutReason] = useState('');

  useEffect(() => {
    let idleTimeoutId: ReturnType<typeof setTimeout>;
    let countdownIntervalId: ReturnType<typeof setInterval>;

    const performAutoLogout = () => {
      onLogout();
    };

    const startCountdown = (reason: string, seconds: number) => {
      setLogoutReason(reason);
      setLogoutCountdown(seconds);
      setShowLogoutWarning(true);
      showLogoutWarningRef.current = true;

      clearInterval(countdownIntervalId);
      
      let timeLeft = seconds;
      countdownIntervalId = setInterval(() => {
        timeLeft -= 1;
        setLogoutCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalId);
          performAutoLogout();
        }
      }, 1000);
    };

    const handleOffline = () => {
      startCountdown("Koneksi internet Anda terputus.", 5);
    };

    window.addEventListener('offline', handleOffline);

    const resetIdleTimer = () => {
      if (showLogoutWarningRef.current) return;
      
      clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        startCountdown("Tidak ada aktivitas yang terdeteksi.", 60);
      }, 840000); // 14 minutes
    };

    resetIdleTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    return () => {
      window.removeEventListener('offline', handleOffline);
      clearTimeout(idleTimeoutId);
      clearInterval(countdownIntervalId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [onLogout]);

  const handleStayLoggedIn = () => {
    setShowLogoutWarning(false);
    showLogoutWarningRef.current = false;
  };

  return (
    <Modal 
      isOpen={showLogoutWarning} 
      onClose={() => {}} // Prevent closing by clicking outside
      title="Peringatan Keamanan Sesi"
      maxWidth="400px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '10px 0' }}>
        <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%', color: '#d97706' }}>
          <AlertTriangle size={48} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Sesi Akan Berakhir</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {logoutReason} Sesi Anda akan otomatis diakhiri dalam:
          </p>
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>
          {logoutCountdown}s
        </div>
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <button 
            className="btn" 
            style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}
            onClick={onLogout}
          >
            Keluar Sekarang
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1 }}
            onClick={handleStayLoggedIn}
          >
            Tetap Login
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AutoLogout;
