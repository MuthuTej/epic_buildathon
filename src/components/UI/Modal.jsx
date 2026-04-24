import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative liq-card-elevated ${width} w-full mx-4 shadow-2xl`}>
        <div className="flex items-start justify-between p-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-white/10 p-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
