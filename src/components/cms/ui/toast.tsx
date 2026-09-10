'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

type Kind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: Kind;
  message: string;
}

const ToastCtx = createContext<{
  toast: (message: string, kind?: Kind) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx.toast;
}

const STYLES: Record<Kind, string> = {
  success: 'border-[--color-success-600]/30 bg-[--color-success-50] text-[--color-success-700]',
  error: 'border-[--color-danger-600]/30 bg-[--color-danger-50] text-[--color-danger-700]',
  info: 'border-line bg-surface text-ink',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toast = useCallback((message: string, kind: Kind = 'info') => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'rounded-xl border px-4 py-3 text-[13px] font-medium shadow-lg',
                  STYLES[t.kind],
                )}
                role="status"
              >
                {t.message}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastCtx.Provider>
  );
}
