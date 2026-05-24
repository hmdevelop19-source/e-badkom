import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface ActionDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: DropdownItem[];
  buttonStyle?: React.CSSProperties;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ label, icon, items, buttonStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="btn" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', ...buttonStyle }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        {label}
        <ChevronDown size={14} style={{ marginLeft: '4px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          minWidth: '160px',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={item.className || ''}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                ...item.style
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
