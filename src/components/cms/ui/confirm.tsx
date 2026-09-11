'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button } from './button';
import { Dialog } from './dialog';

interface Options {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const ConfirmCtx = createContext<((o: Options) => Promise<boolean>) | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Options | null>(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef<(v: boolean) => void>(() => {});

  const confirm = useCallback((o: Options) => {
    setState(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (v: boolean) => {
    resolver.current(v);
    setState(null);
    setBusy(false);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Dialog
        open={!!state}
        onClose={() => close(false)}
        title={state?.title}
        description={state?.message}
        size="sm"
        footer={
          <>
            <Button
              variant={state?.danger ? 'danger' : 'primary'}
              size="sm"
              loading={busy}
              onClick={() => {
                setBusy(true);
                close(true);
              }}
            >
              {state?.confirmLabel ?? 'Confirm'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => close(false)}>
              {state?.cancelLabel ?? 'Cancel'}
            </Button>
          </>
        }
      />
    </ConfirmCtx.Provider>
  );
}
