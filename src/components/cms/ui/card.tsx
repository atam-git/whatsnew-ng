import { cn } from '@/lib/utils/cn';

export function Card({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('border-line bg-surface rounded-2xl border', className)}>
      {(title || actions) && (
        <header className="border-line flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            {title && <h2 className="text-ink text-[15px] font-semibold">{title}</h2>}
            {description && <p className="text-muted mt-0.5 text-[13px]">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
