'use client';

import { CmsQueryProvider } from '@/lib/cms/query';
import { ToastProvider } from './ui/toast';
import { ConfirmProvider } from './ui/confirm';

export function CmsProviders({ children }: { children: React.ReactNode }) {
  return (
    <CmsQueryProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </CmsQueryProvider>
  );
}
