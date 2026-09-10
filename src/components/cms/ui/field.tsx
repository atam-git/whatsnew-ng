import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-ink text-[13px] font-semibold">
          {label}
          {required && <span className="text-[--color-danger-600]"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-[--color-danger-600]">{error}</p>
      ) : hint ? (
        <p className="text-muted text-[12px]">{hint}</p>
      ) : null}
    </div>
  );
}

const baseControl =
  'w-full rounded-lg border bg-surface px-3 text-sm text-ink transition placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-canvas disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(baseControl, 'h-10', invalid ? 'border-[--color-danger-600]' : 'border-line', className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, rows = 3, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseControl, 'py-2 leading-relaxed', invalid ? 'border-[--color-danger-600]' : 'border-line', className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(baseControl, 'h-10 cursor-pointer pr-8', invalid ? 'border-[--color-danger-600]' : 'border-line', className)}
      {...props}
    >
      {children}
    </select>
  );
});

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm">
      <span className="relative inline-flex">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="bg-line peer-checked:bg-brand-600 peer-focus-visible:ring-brand-500/30 h-5 w-9 rounded-full transition peer-focus-visible:ring-2" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </span>
      {label && <span className="text-ink">{label}</span>}
    </label>
  );
}
