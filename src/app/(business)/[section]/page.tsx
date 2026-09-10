import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { CONTENT_PATHS, listContent, type ContentPath } from '@/lib/api/content';
import { ContentCard } from '@/components/business/content-card';
import type { Paginated, ContentCard as Card } from '@/lib/api/types';

const CONTENT_SECTIONS = new Set<string>(Object.values(CONTENT_PATHS));

/** Per-section heading + SEO copy. Keyed by URL segment. */
const SECTION_META: Record<string, { heading: string; title: string; description: string }> = {
  restaurants: {
    heading: 'New restaurants',
    title: 'New restaurants in Nigeria',
    description:
      'Fresh openings, tasting menus and dining rooms worth a table across Nigeria — updated every week.',
  },
  hotels: {
    heading: 'New hotels & stays',
    title: 'New hotels & stays in Nigeria',
    description:
      'Just-opened hotels, lodges and city stays across Nigeria, updated every week.',
  },
  events: {
    heading: "What's on",
    title: "What's on in Nigeria",
    description:
      'Concerts, festivals, pop-ups and one-off events happening across Nigeria.',
  },
  songs: {
    heading: 'New music',
    title: 'New Nigerian music',
    description:
      'Fresh singles, EPs and albums from Nigerian artists, updated every week.',
  },
  videos: {
    heading: 'New video',
    title: 'New Nigerian video',
    description:
      'Music videos, shorts and series worth watching from Nigerian creators.',
  },
  startups: {
    heading: 'New startups',
    title: 'New Nigerian startups',
    description:
      'Companies that just launched, raised or shipped something new in Nigeria.',
  },
  businesses: {
    heading: 'New businesses',
    title: 'New businesses in Nigeria',
    description:
      'Shops, studios and services that just opened their doors across Nigeria.',
  },
  churches: {
    heading: 'Faith events',
    title: 'Faith events in Nigeria',
    description:
      'Services, conventions and gatherings happening at churches across Nigeria.',
  },
  opportunities: {
    heading: 'Opportunities',
    title: 'Opportunities in Nigeria',
    description:
      'Jobs, grants, fellowships and open calls for people building in Nigeria.',
  },
  reads: {
    heading: 'Reads',
    title: 'Reads',
    description:
      'Long-form on the people, places and ideas shaping what’s new in Nigeria.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const meta = SECTION_META[section];
  if (!meta) return {};
  const url = `${env.siteUrl}/${section}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/${section}` },
    openGraph: { type: 'website', title: `${meta.title} · Whatsnew.ng`, description: meta.description, url },
    twitter: { card: 'summary_large_image', title: `${meta.title} · Whatsnew.ng`, description: meta.description },
  };
}

/** Content-type listing pages: /hotels, /reads, /events, … */
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!CONTENT_SECTIONS.has(section)) notFound();

  const meta = SECTION_META[section];
  const { data } = (await listContent(section as ContentPath, {
    status: 'PUBLISHED',
    limit: 24,
  })) as Paginated<Card>;

  return (
    <div>
      <h1 className="text-2xl font-bold capitalize">{meta?.heading ?? section}</h1>
      {meta && <p className="text-muted mt-2 max-w-2xl">{meta.description}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
      {data.length === 0 && <p className="text-muted mt-6">Nothing published here yet.</p>}
    </div>
  );
}
