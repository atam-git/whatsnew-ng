'use client';

import { useMemo, useState } from 'react';
import type { ContentCard as Card, ContentType } from '@/lib/api/types';
import { ContentCard } from './content-card';

const TABS: { label: string; types: ContentType[] | null }[] = [
  { label: 'Everything', types: null },
  { label: 'Places', types: ['HOTEL', 'RESTAURANT'] },
  { label: 'Music', types: ['SONG'] },
  { label: 'Business', types: ['STARTUP', 'BUSINESS'] },
];

const PAGE = 8;

/** Sitewide mixed feed with type-group tabs + "load more" (client-side). */
export function ExploreAll({ items }: { items: Card[] }) {
  const [tab, setTab] = useState(0);
  const [count, setCount] = useState(PAGE);

  const filtered = useMemo(() => {
    const types = TABS[tab].types;
    return types ? items.filter((i) => types.includes(i.type)) : items;
  }, [items, tab]);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-ink text-2xl font-bold tracking-tight">Explore all</h2>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t, i) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setTab(i);
                setCount(PAGE);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                i === tab ? 'bg-ink text-white' : 'bg-surface text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.slice(0, count).map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {count < filtered.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setCount((c) => c + PAGE)}
            className="border-line text-ink hover:border-ink rounded-full border bg-surface px-6 py-2.5 text-sm font-semibold transition"
          >
            Load more
          </button>
        </div>
      )}
    </section>
  );
}
