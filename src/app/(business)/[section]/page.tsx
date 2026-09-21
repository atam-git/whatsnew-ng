import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { CONTENT_PATHS, listContent, type ContentPath } from '@/lib/api/content';
import { ContentCard } from '@/components/business/content-card';
import type { Paginated, ContentCard as Card } from '@/lib/api/types';
import { AdsProvider, LeaderboardAd, MobileBannerAd } from '@/components/ads';
import { NewsletterSignup } from '@/components/business/newsletter-signup';

const CONTENT_SECTIONS = new Set<string>(Object.values(CONTENT_PATHS));

/** Per-section heading + SEO copy. Keyed by URL segment. */
const SECTION_META: Record<string, { heading: string; title: string; description: string }> = {
  restaurants: {
    heading: 'New restaurants',
    title: 'New restaurants in Nigeria',
    description:
      'Fresh openings, tasting menus and dining rooms worth a table across Nigeria - updated every week.',
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
  films: {
    heading: 'New films',
    title: 'New films in Nigeria',
    description:
      'Nollywood and international releases hitting cinemas and streaming across Nigeria.',
  },
  airlines: {
    heading: 'Airlines & routes',
    title: 'New airline routes in Nigeria',
    description:
      'New airlines, routes and flight launches serving Nigeria.',
  },
  'real-estate': {
    heading: 'Real estate',
    title: 'New real estate developments in Nigeria',
    description:
      'New housing and commercial developments from developers across Nigeria.',
  },
  podcasts: {
    heading: 'Podcasts',
    title: 'New Nigerian podcasts',
    description:
      'Podcasts and episodes worth a listen from Nigerian hosts and shows.',
  },
  venues: {
    heading: 'Venues',
    title: 'Venues in Nigeria',
    description:
      'Event spaces, clubs, galleries and coworking spots worth booking across Nigeria.',
  },
  education: {
    heading: 'Education',
    title: 'Programs & courses in Nigeria',
    description:
      'Degrees, bootcamps, certificates and workshops open for application in Nigeria.',
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
    openGraph: {
      type: 'website',
      title: `${meta.title} · Whatsnew.ng`,
      description: meta.description,
      url,
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} · Whatsnew.ng`,
      description: meta.description,
      images: ['/og-default.png'],
    },
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
    <AdsProvider>
      <div>
        <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-2xl font-bold capitalize">{meta?.heading ?? section}</h1>
        {meta && <p className="text-muted animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 mt-2 max-w-2xl">{meta.description}</p>}
        
        {data.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <svg 
              className="mx-auto h-16 w-16 text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nothing here yet</h3>
            <p className="text-muted mt-2 max-w-md text-sm">
              We&apos;re working on bringing you the latest {meta?.heading.toLowerCase() || section}. Check back soon!
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Ad placement: Before newsletter */}
        <div className="mt-16">
          <LeaderboardAd className="mb-8" />
          <MobileBannerAd className="mb-8" />
        </div>

        {/* Newsletter Signup */}
        <section className="mt-8 pb-16">
          <NewsletterSignup />
        </section>
      </div>
    </AdsProvider>
  );
}
