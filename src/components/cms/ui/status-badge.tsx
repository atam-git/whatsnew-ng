import { cn } from '@/lib/utils/cn';
import type { ContentStatus } from '@/lib/api/types';

const STYLES: Record<string, string> = {
  // content statuses - distinct colors
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-300',
  // newsletter issue statuses
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
