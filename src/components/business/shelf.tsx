import Link from 'next/link';
import type { HomepageShelf } from '@/lib/api/types';
import { ContentCard } from './content-card';

export function Shelf({ shelf, viewAllHref }: { shelf: HomepageShelf; viewAllHref?: string }) {
  if (shelf.items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">{shelf.title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-brand-600 text-sm hover:underline">
            View all
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shelf.items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
