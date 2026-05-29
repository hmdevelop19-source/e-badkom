import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from '../components/Modal';

interface DialogContextType {
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Konfirmasi');
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const showConfirm = (msg: string, onConfirm: () => void, customTitle?: string) => {
    setMessage(msg);
    setOnConfirmCallback(() => onConfirm);
    setTitle(customTitle || 'Konfirmasi Tindakan');
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider value={{ showConfirm }}>
      {children}
      <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="400px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              className="btn" 
              onClick={handleClose}
              style={{ background: '#f1f5f9', color: '#475569' }}
            >
              Batal
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleConfirm}
              style={{ background: '#ef4444' }}
            >
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
};
