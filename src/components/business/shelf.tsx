import Link from 'next/link';
import type { HomepageShelf } from '@/lib/api/types';
import { ContentCard } from './content-card';

export function Shelf({ shelf, viewAllHref }: { shelf: HomepageShelf; viewAllHref?: string }) {
  if (shelf.items.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-heading text-ink text-2xl font-bold tracking-tight">{shelf.title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm font-semibold transition"
          >
            View all
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shelf.items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
