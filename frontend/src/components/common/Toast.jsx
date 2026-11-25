import { useState, useCallback } from 'react';
import { ToastContext } from './useToast';

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#161b22',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: 13,
          fontWeight: 500
        }}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
