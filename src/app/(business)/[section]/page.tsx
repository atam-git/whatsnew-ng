import { notFound } from 'next/navigation';
import { CONTENT_PATHS, listContent, type ContentPath } from '@/lib/api/content';
import { ContentCard } from '@/components/business/content-card';
import type { Paginated, ContentCard as Card } from '@/lib/api/types';

const CONTENT_SECTIONS = new Set<string>(Object.values(CONTENT_PATHS));

/** Content-type listing pages: /hotels, /reads, /events, … */
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!CONTENT_SECTIONS.has(section)) notFound();

  const { data } = (await listContent(section as ContentPath, {
    status: 'PUBLISHED',
    limit: 24,
  })) as Paginated<Card>;

  return (
    <div>
      <h1 className="text-2xl font-bold capitalize">{section}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
      {data.length === 0 && <p className="text-muted mt-6">Nothing published here yet.</p>}
    </div>
  );
}
