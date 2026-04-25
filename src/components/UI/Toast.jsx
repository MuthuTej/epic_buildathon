import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      idCounter += 1;
      const id = idCounter;
      const t = { id, type: 'info', duration: 3000, ...toast };
      setToasts((prev) => [...prev, t]);
      setTimeout(() => dismiss(id), t.duration);
    },
    [dismiss]
  );

  const api = {
    success: (title, message) => push({ type: 'success', title, message }),
    error: (title, message) => push({ type: 'error', title, message }),
    warning: (title, message) => push({ type: 'warning', title, message }),
    info: (title, message) => push({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-[360px]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const styles = {
  success: { bar: '#046307', Icon: CheckCircle2 },
  error:   { bar: '#EF4444', Icon: XCircle },
  warning: { bar: '#EAB308', Icon: AlertTriangle },
  info:    { bar: '#0B6E4F', Icon: Info },
};

function ToastItem({ toast, onClose }) {
  const s = styles[toast.type] || styles.info;
  const Icon = s.Icon;
  return (
    <div
      className="liq-card-elevated toast-in flex items-start gap-3 p-3 pr-2 shadow-2xl"
      style={{ borderLeft: `3px solid ${s.bar}` }}
    >
      <Icon size={18} style={{ color: s.bar }} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{toast.title}</div>
        {toast.message && <div className="text-xs text-muted-foreground mt-0.5">{toast.message}</div>}
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
