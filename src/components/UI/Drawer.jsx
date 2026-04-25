import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-in" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 h-full bg-white border-l border-gray-200 drawer-in flex flex-col shadow-2xl"
        style={{ width }}
      >
        <header className="flex items-start justify-between gap-3 p-5 border-b border-gray-200">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 shrink-0">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">{children}</div>
        {footer && <div className="border-t border-gray-200 p-4 flex justify-end gap-2">{footer}</div>}
      </aside>
    </div>
  );
}
