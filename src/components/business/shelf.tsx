import Link from 'next/link';
import type { HomepageShelf } from '@/lib/api/types';
import { ContentCard } from './content-card';

export function ShelfHeading({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className="border-line mb-6 flex items-baseline justify-between border-b pb-3">
      <h2 className="font-heading text-ink text-[32px] font-bold leading-tight tracking-tight">
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-[15px] font-semibold transition"
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
  );
}

export function Shelf({
  shelf,
  viewAllHref,
  cols = 4,
}: {
  shelf: HomepageShelf;
  viewAllHref?: string;
  cols?: 2 | 3 | 4;
}) {
  if (shelf.items.length === 0) return null;

  const grid =
    cols === 2
      ? 'sm:grid-cols-1 md:grid-cols-2'
      : cols === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <section>
      <ShelfHeading title={shelf.title} viewAllHref={viewAllHref} />
      <div className={`grid gap-5 ${grid}`}>
        {shelf.items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
