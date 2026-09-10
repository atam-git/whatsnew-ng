import { cn } from '@/lib/utils/cn';
import type { ContentStatus } from '@/lib/api/types';

const STYLES: Record<string, string> = {
  DRAFT: 'bg-canvas text-muted-700 border-line',
  PUBLISHED: 'bg-[--color-success-50] text-[--color-success-700] border-[--color-success-600]/20',
  ARCHIVED: 'bg-canvas text-muted border-line',
  // newsletter issue statuses
  SCHEDULED: 'bg-[--color-warning-50] text-[--color-warning-700] border-[--color-warning-600]/20',
  SENDING: 'bg-[--color-warning-50] text-[--color-warning-700] border-[--color-warning-600]/20',
  SENT: 'bg-[--color-success-50] text-[--color-success-700] border-[--color-success-600]/20',
  FAILED: 'bg-[--color-danger-50] text-[--color-danger-700] border-[--color-danger-600]/20',
  // submissions
  PENDING: 'bg-[--color-warning-50] text-[--color-warning-700] border-[--color-warning-600]/20',
  APPROVED: 'bg-[--color-success-50] text-[--color-success-700] border-[--color-success-600]/20',
  REJECTED: 'bg-[--color-danger-50] text-[--color-danger-700] border-[--color-danger-600]/20',
  NEW: 'bg-brand-50 text-brand-700 border-brand-600/20',
  READ: 'bg-canvas text-muted border-line',
  SPAM: 'bg-[--color-danger-50] text-[--color-danger-700] border-[--color-danger-600]/20',
};

export function StatusBadge({ status, className }: { status: ContentStatus | string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        STYLES[status] ?? 'bg-canvas text-muted border-line',
        className,
      )}
    >
      {String(status).toLowerCase().replace(/_/g, ' ')}
    </span>
  );
}
