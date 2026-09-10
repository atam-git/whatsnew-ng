'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchContent, type SearchResponse } from '@/lib/api/search';
import { ContentCard } from '@/components/business/content-card';

const TYPES: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Reads', value: 'READ' },
  { label: 'Restaurants', value: 'RESTAURANT' },
  { label: 'Hotels', value: 'HOTEL' },
  { label: 'Events', value: 'EVENT' },
  { label: 'Music', value: 'SONG' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Startups', value: 'STARTUP' },
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Faith', value: 'CHURCH' },
  { label: 'Opportunities', value: 'OPPORTUNITY' },
];

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [type, setType] = useState('');
  const [res, setRes] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = useCallback((term: string, t: string) => {
    setLoading(true);
    searchContent(term, t || undefined)
      .then(setRes)
      .catch(() => setRes({ data: [], meta: { total: 0, q: term.trim(), browse: !term.trim() } }))
      .finally(() => setLoading(false));
  }, []);

  // Debounced query + URL sync. Empty query is allowed (browse mode).
  useEffect(() => {
    const id = setTimeout(() => {
      run(q, type);
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      router.replace(`/search${sp.toString() ? `?${sp}` : ''}`, { scroll: false });
    }, 250);
    return () => clearTimeout(id);
  }, [q, type, run, router]);

  const heading = res?.meta.browse
    ? 'Latest on Whatsnew.ng'
    : res
      ? `${res.meta.total} result${res.meta.total === 1 ? '' : 's'} for “${res.meta.q}”`
      : '';

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-ink text-2xl font-bold sm:text-3xl">Search</h1>

      <div className="border-line focus-within:border-brand-500 mt-4 flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition">
        <svg className="text-muted h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Restaurants, artists, events, startups…"
          className="text-ink placeholder:text-muted/70 w-full bg-transparent text-[16px] outline-none"
        />
        {q && (
          <button onClick={() => setQ('')} className="text-muted hover:text-ink text-sm" aria-label="Clear">
            Clear
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-full border px-3 py-1 text-[13px] transition ${
              type === t.value
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-line text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading && !res ? (
          <p className="text-muted text-[15px]">Loading…</p>
        ) : res && res.data.length === 0 ? (
          <p className="text-muted text-[15px]">
            {res.meta.browse
              ? 'Nothing published yet.'
              : `No published results for “${res.meta.q}”.`}
          </p>
        ) : res ? (
          <>
            <p className="text-muted mb-4 text-[13px]">{heading}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {res.data.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-muted mx-auto max-w-5xl">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
