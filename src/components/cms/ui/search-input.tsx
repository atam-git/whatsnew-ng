'use client';

import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  shortcut = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  shortcut?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcut]);

  return (
    <div className={cn('relative', className)}>
      <Search className="text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-line bg-surface text-ink placeholder:text-muted/70 focus:ring-brand-500/30 h-10 w-full rounded-lg border pl-9 pr-3 text-sm transition focus:outline-none focus:ring-2"
      />
    </div>
  );
}
