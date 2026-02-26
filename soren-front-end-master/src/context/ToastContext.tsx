import { Alert, Snackbar } from '@mui/material';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocale } from './LocaleContext';

type ToastKind = 'success' | 'error' | 'info';

type ToastState = {
  open: boolean;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { direction } = useLocale();
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    kind: 'info',
  });

  const value = useMemo(
    () => ({
      showToast: (message: string, kind: ToastKind = 'info') => {
        setToast({ open: true, message, kind });
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((old) => ({ ...old, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'rtl' ? 'left' : 'right' }}
      >
        <Alert
          variant="filled"
          severity={toast.kind}
          sx={{ width: '100%' }}
          onClose={() => setToast((old) => ({ ...old, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
