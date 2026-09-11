'use client';

import Image from 'next/image';
import { Dialog } from './ui';

/**
 * Shows the issue the way an admin would actually encounter it: the inbox
 * list row first (sender, subject, preview text - exactly what the hidden
 * preheader in the email HTML is for), then the real rendered email body
 * underneath in an iframe, so there's no guessing between "what shows before
 * you open it" and "what's inside".
 */
export function NewsletterPreviewDialog({
  open,
  onClose,
  subject,
  previewText,
  previewUrl,
}: {
  open: boolean;
  onClose: () => void;
  subject: string;
  previewText?: string | null;
  previewUrl: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Inbox preview" size="xl">
      <div className="space-y-4">
        <div>
          <p className="text-muted mb-2 text-[11px] font-semibold uppercase tracking-wide">
            Before it&apos;s opened
          </p>
          <div className="border-line bg-surface flex items-start gap-3 rounded-xl border p-3 shadow-sm">
            <div className="bg-brand-50 relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <Image src="/Whatsnew.ng.png" alt="" width={72} height={48} className="h-5 w-auto" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-ink truncate text-[13px] font-semibold">Whatsnew.ng</span>
                <span className="text-muted shrink-0 text-[11px]">now</span>
              </div>
              <p className="mt-0.5 truncate text-[13px]">
                <span className="text-ink font-semibold">{subject || 'Untitled issue'}</span>
                {previewText && <span className="text-muted"> — {previewText}</span>}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-muted mb-2 text-[11px] font-semibold uppercase tracking-wide">
            Once opened
          </p>
          <div className="border-line overflow-hidden rounded-xl border">
            <iframe
              src={previewUrl}
              title="Email preview"
              className="h-[70vh] w-full bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
