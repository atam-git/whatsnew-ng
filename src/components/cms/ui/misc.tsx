import { cn } from '@/lib/utils/cn';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="border-line flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
      {icon && <div className="text-muted/60 mb-3">{icon}</div>}
      <p className="text-ink text-sm font-semibold">{title}</p>
      {description && <p className="text-muted mt-1 max-w-sm text-[13px]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-line/70 animate-pulse rounded-md', className)} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="border-line bg-surface divide-line divide-y overflow-hidden rounded-2xl border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-10 w-14 shrink-0 rounded-lg" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      aria-label="Loading"
    />
  );
}
