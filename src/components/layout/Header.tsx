import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, LogOut, Menu, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  currentUser: any;
  level: string;
  onLogout: () => void;
  profileLink: string;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, currentUser, level, onLogout, profileLink, onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <style>{`
        .top-header-enhanced {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.05);
          z-index: 40;
          transition: all 0.3s ease;
        }
        @media (max-width: 768px) {
          .top-header-enhanced {
            padding: 12px 20px;
          }
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          margin-left: -8px;
          margin-right: 12px;
          border-radius: 8px;
        }
        .mobile-menu-btn:hover {
          background: rgba(0,0,0,0.05);
          color: var(--primary);
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .header-right-actions {
            gap: 12px !important;
          }
          .profile-dropdown-btn {
            padding: 6px !important;
          }
        }
        .header-search-container {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 9999px;
          padding: 10px 24px;
          flex: 1;
          max-width: 480px;
          gap: 12px;
          transition: all 0.2s;
        }
        .header-search-container:focus-within {
          background: #fff;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
        }
        .header-search-input {
          border: none !important;
          background: transparent !important;
          outline: none !important;
          width: 100% !important;
          font-size: 0.95rem !important;
          color: #334155 !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
        .header-search-input::placeholder {
          color: #94a3b8;
        }
        .profile-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 40px;
          background: transparent;
          border: none;
          transition: opacity 0.2s;
        }
        .profile-dropdown-btn:hover {
          opacity: 0.8;
        }
      `}</style>
      <header className="top-header-enhanced">
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '24px' }}>
          {onToggleSidebar && (
            <button className="mobile-menu-btn" onClick={onToggleSidebar}>
              <Menu size={24} />
            </button>
          )}
          <div className="header-search-container hide-on-mobile">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Cari data, laporan, atau wilayah..."
            />
          </div>
        </div>

        <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', position: 'relative', padding: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
          >
            <Bell size={18} />
            <span style={{ position: 'absolute', top: '6px', right: '8px', width: '6px', height: '6px', background: 'var(--error)', borderRadius: '50%', border: '2px solid #fff' }}></span>
          </button>

          <div className="hide-on-mobile" style={{ width: '1px', height: '28px', background: 'var(--border)' }}></div>

          <div style={{ position: 'relative' }}>
            <div
              className="profile-dropdown-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem' }}>
                  {currentUser?.fullname || 'Administrator'}
                </span>
              </div>
              {currentUser?.foto_profil ? (
                <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${currentUser.foto_profil}`} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #4c1d95 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                  {currentUser?.fullname?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>

            {isProfileOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setIsProfileOpen(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  zIndex: 100,
                  minWidth: '220px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '8px',
                  animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Login sebagai</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email || currentUser?.username || 'admin'}</p>
                  </div>
                  <Link
                    to={profileLink}
                    onClick={() => setIsProfileOpen(false)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#334155',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                  >
                    <User size={16} />
                    Profil Saya
                  </Link>
                  <button
                    onClick={onLogout}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontWeight: 500,
                      textAlign: 'left',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
