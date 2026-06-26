import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext(null);

/** Provider powiadomień (snackbar). Zastępuje natywne alert(). */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const showToast = useCallback((message, severity = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const value = {
    showToast,
    success: (m) => showToast(m, 'success'),
    error: (m) => showToast(m, 'error'),
    info: (m) => showToast(m, 'info'),
    warning: (m) => showToast(m, 'warning'),
  };

  const handleClose = (_e, reason) => {
    if (reason === 'clickaway') return;
    setToast((t) => ({ ...t, open: false }));
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast musi być użyte wewnątrz <ToastProvider>');
  }
  return ctx;
}

export default ToastContext;
