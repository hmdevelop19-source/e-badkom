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
    <div ref={dropdownRef} className="relative inline-block text-left w-full md:w-auto">
      <button 
        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-90 active:scale-95"
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white border border-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#008FD7] transition-colors ${item.className || ''}`}
                style={item.style}
              >
                <span className="text-slate-400 group-hover:text-[#008FD7] transition-colors">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
