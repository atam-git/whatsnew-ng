'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useContentSearch } from '@/lib/cms/admin-hooks';
import { SearchInput, Spinner } from './ui';
import { StatusBadge } from './ui/status-badge';

export interface PickedContent {
  id: string;
  type: string;
  title: string;
  status: string;
}

/** Search-and-add box for pulling content items into a shelf or newsletter issue. */
export function ContentPicker({
  onAdd,
  excludeIds = [],
  type,
}: {
  onAdd: (c: PickedContent) => void;
  excludeIds?: string[];
  type?: string;
}) {
  const [q, setQ] = useState('');
  const { data, isFetching } = useContentSearch(q, type);
  const results = (data ?? []).filter((r) => !excludeIds.includes(r.id));

  return (
    <div>
      <SearchInput value={q} onChange={setQ} placeholder="Search published content…" />
      {q.trim().length > 1 && (
        <div className="border-line mt-2 max-h-64 overflow-y-auto rounded-lg border">
          {isFetching ? (
            <div className="flex justify-center py-6">
              <Spinner className="text-muted" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-muted px-3 py-6 text-center text-[13px]">No matches.</p>
          ) : (
            <ul className="divide-line divide-y">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(r);
                      setQ('');
                    }}
                    className="hover:bg-canvas flex w-full items-center gap-2 px-3 py-2 text-left"
                  >
                    <Plus className="text-brand-600 h-4 w-4 shrink-0" />
                    <span className="text-ink min-w-0 flex-1 truncate text-[13px]">{r.title}</span>
                    <span className="text-muted text-[11px] uppercase">{r.type}</span>
                    <StatusBadge status={r.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
