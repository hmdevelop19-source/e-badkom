import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import logoBadkom from '../../assets/LOGOBADKOM.png';

export interface SubNavItem {
  label: string;
  path: string;
}

export interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  subItems?: SubNavItem[];
}

interface SidebarProps {
  navItems: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, onClose }) => {
  const location = useLocation();
  
  // Open menus based on active location
  const getInitialOpenMenus = () => {
    const initialState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems) {
        const isActive = item.subItems.some(sub => location.pathname.includes(sub.path));
        if (isActive) {
          initialState[item.label] = true;
        }
      }
    });
    return initialState;
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(getInitialOpenMenus());

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => {
      // Jika menu yang diklik sudah terbuka, maka tutup.
      if (prev[label]) {
        return { [label]: false };
      }
      // Jika menu yang diklik tertutup, buka menu tersebut dan tutup otomatis menu lain.
      return { [label]: true };
    });
  };

  return (
    <>
      <style>{`
        /* Enhanced Sidebar Styles */
        .sidebar-enhanced {
          width: 280px;
          background: linear-gradient(180deg, var(--primary) 0%, #2a1f4a 100%);
          color: #E5E0D8;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow-y: auto;
          box-shadow: 4px 0 24px rgba(0,0,0,0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
        }
        
        @media (max-width: 768px) {
          .sidebar-enhanced {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar-enhanced.open {
            transform: translateX(0);
          }
        }

        @media (min-width: 769px) {
          .sidebar-enhanced {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-x: hidden;
          }
          .sidebar-enhanced:not(.open) {
            width: 84px;
            padding: 24px 12px;
          }
          
          .sidebar-enhanced:not(.open) .sidebar-logo-container {
            padding: 8px 0;
            justify-content: center;
          }

          .sidebar-enhanced:not(.open) .logo-text,
          .sidebar-enhanced:not(.open) .nav-label,
          .sidebar-enhanced:not(.open) .nav-chevron,
          .sidebar-enhanced:not(.open) .sub-menu-container {
            display: none !important;
          }

          .sidebar-enhanced:not(.open) .nav-link-dynamic {
            padding: 12px 0;
            justify-content: center;
          }

          .sidebar-enhanced:not(.open) .nav-icon-wrapper {
            justify-content: center;
            width: 100%;
          }
        }
        
        .sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 49;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .sidebar-backdrop.open {
            display: block;
            opacity: 1;
          }
        }
        
        .sidebar-enhanced::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-enhanced::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .sidebar-enhanced::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-logo-container {
          padding: 8px 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.02);
        }

        .nav-link-dynamic {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 10px;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
        }

        .nav-link-dynamic:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #f8fafc;
          transform: translateX(4px);
        }

        .nav-link-dynamic.active {
          background: rgba(0, 143, 215, 0.15); /* var(--secondary) tint */
          color: #ffffff;
          font-weight: 600;
          box-shadow: inset 0 0 0 1px rgba(0, 143, 215, 0.3);
        }

        .nav-link-dynamic.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60%;
          width: 4px;
          background: var(--secondary);
          border-radius: 0 4px 4px 0;
        }

        .sub-menu-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 42px;
          margin-top: 4px;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sub-menu-container::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 0;
          bottom: 16px;
          width: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .sub-nav-link {
          padding: 10px 16px;
          font-size: 0.875rem;
          color: #94a3b8;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }

        .sub-nav-link::before {
          content: '';
          position: absolute;
          left: -18px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }

        .sub-nav-link:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.04);
        }

        .sub-nav-link:hover::before {
          background: var(--secondary);
          width: 16px;
        }

        .sub-nav-link.active {
          color: #ffffff;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.08);
        }

        .sub-nav-link.active::before {
          background: var(--secondary);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      
      <aside className={`sidebar-enhanced ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-container">
          <img src={logoBadkom} alt="Logo E-Badkom" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <div className="logo-text">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>E-BADKOM</h2>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Sistem Informasi</p>
          </div>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            if (item.subItems && item.subItems.length > 0) {
              const isMenuOpen = openMenus[item.label];

              return (
                <div key={item.label}>
                  <button 
                    className="nav-link-dynamic" 
                    style={{ background: isMenuOpen ? 'rgba(255, 255, 255, 0.04)' : 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}
                    onClick={() => {
                      if (!isOpen && window.innerWidth > 768) return; // Optional: prevent toggle when mini
                      toggleMenu(item.label);
                    }}
                  >
                    <div className="nav-icon-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <item.icon size={20} color={isMenuOpen ? "#ffffff" : "currentColor"} />
                      <span className="nav-label" style={{ color: isMenuOpen ? "#ffffff" : "inherit" }}>{item.label}</span>
                    </div>
                    <div className="nav-chevron">
                      {isMenuOpen ? <ChevronDown size={16} color="#ffffff" /> : <ChevronRight size={16} />}
                    </div>
                  </button>
                  {isMenuOpen && (
                    <div className="sub-menu-container">
                      {item.subItems.map(subItem => (
                        <Link 
                          key={subItem.path}
                          to={subItem.path} 
                          className={`sub-nav-link ${location.pathname === subItem.path ? 'active' : ''}`}
                          onClick={() => { if (window.innerWidth <= 768 && onClose) onClose(); }}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link 
                key={item.path}
                to={item.path as string} 
                className={`nav-link-dynamic ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => { if (window.innerWidth <= 768 && onClose) onClose(); }}
              >
                <div className="nav-icon-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <item.icon size={20} />
                  <span className="nav-label">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
