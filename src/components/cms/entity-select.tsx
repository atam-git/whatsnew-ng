'use client';

import { useMemo, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface EntityOption {
  id: string;
  name: string;
}

export function EntitySelect({
  options,
  value,
  onChange,
  placeholder = 'Add…',
  onCreate,
  creating,
}: {
  options: EntityOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  onCreate?: (name: string) => Promise<EntityOption>;
  creating?: boolean;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const chips = value.map((id) => byId.get(id)).filter(Boolean) as EntityOption[];

  const matches = options.filter(
    (o) => !value.includes(o.id) && o.name.toLowerCase().includes(q.toLowerCase()),
  );
  const exact = options.find((o) => o.name.toLowerCase() === q.trim().toLowerCase());
  const canCreate = onCreate && q.trim().length > 1 && !exact;

  const add = (id: string) => {
    onChange([...value, id]);
    setQ('');
  };

  return (
    <div
      ref={wrap}
      className="border-line bg-surface focus-within:ring-brand-500/30 relative rounded-lg border px-2 py-1.5 focus-within:ring-2"
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((c) => (
          <span
            key={c.id}
            className="bg-brand-50 text-brand-700 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px] font-medium"
          >
            {c.name}
            <button
              type="button"
              onClick={() => onChange(value.filter((id) => id !== c.id))}
              className="hover:text-brand-800"
              aria-label={`Remove ${c.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={chips.length ? '' : placeholder}
          className="text-ink placeholder:text-muted/70 min-w-[80px] flex-1 bg-transparent py-1 text-sm focus:outline-none"
        />
      </div>

      {open && (matches.length > 0 || canCreate) && (
        <div className="border-line bg-surface absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border shadow-lg">
          {matches.slice(0, 20).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => add(o.id)}
              className="hover:bg-canvas block w-full px-3 py-2 text-left text-[13px]"
            >
              {o.name}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              disabled={creating}
              onClick={async () => {
                const created = await onCreate!(q.trim());
                add(created.id);
              }}
              className={cn(
                'text-brand-700 hover:bg-brand-50 flex w-full items-center gap-1.5 px-3 py-2 text-left text-[13px] font-medium',
              )}
            >
              <Plus className="h-3.5 w-3.5" /> Create “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
