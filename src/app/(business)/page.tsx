import Link from 'next/link';
import type { ContentCard } from '@/lib/api/types';
import { getHomepage } from '@/lib/api/content';
import { SectionBand } from '@/components/business/section-band';
import { FeaturedArticle } from '@/components/business/featured-article';
import { Shelf } from '@/components/business/shelf';
import { RecentSection } from '@/components/business/recent-section';
import { TestimonialBlock } from '@/components/business/testimonial-block';
import { ExploreAll } from '@/components/business/explore-all';
import { NewsletterSignup } from '@/components/business/newsletter-signup';
import { SecondaryPromo } from '@/components/business/secondary-promo';

// Homepage. Section order + shelf contents come from the CMS homepage singleton
// (resolved by the backend's /homepage endpoint). A few sections are fixed
// design elements: Featured hero, the testimonial band, Explore-all, the promo.

const VIEW_ALL: Record<string, string> = {
  opportunities: '/opportunities',
  music: '/songs',
  hotels: '/hotels',
  startups: '/startups',
  events: '/events',
  reads: '/reads',
  video: '/videos',
  restaurants: '/restaurants',
  new_business: '/businesses',
};

// Shelves that render on a full-bleed white band (the rest sit on the page bg).
const SURFACE_BANDS = new Set(['opportunities', 'startups', 'new_business']);

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string }>;
}) {
  const { city, state } = await searchParams;

  // Live CMS data only — no dummy fallback (that leaked fake tags like
  // "Health Tech" whenever the API blipped). An empty API response just
  // renders the fixed sections.
  const shelves = await getHomepage(city, state).catch(() => []);

  // De-duped pool of every card on the page, for the Explore-all feed.
  const seen = new Set<string>();
  const allItems: ContentCard[] = [];
  for (const shelf of shelves) {
    for (const item of shelf.items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        allItems.push(item);
      }
    }
  }
  const featured = allItems.find((i) => i.featured) ?? allItems[0] ?? null;

  return (
    <div className="space-y-16">
      {state && (
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          <span className="text-gray-600">
            Showing what&rsquo;s new in <span className="font-semibold text-ink">{state}</span>
          </span>
          <Link href="/" className="font-medium text-brand-600 hover:underline">
            Clear
          </Link>
        </div>
      )}

      {featured && (
        <SectionBand>
          <FeaturedArticle item={featured} />
        </SectionBand>
      )}

      {shelves.map((shelf) => {
        const blocks: React.ReactNode[] = [];

        if (shelf.key === 'most_recent') {
          const items = shelf.items.filter((i) => i.id !== featured?.id);
          blocks.push(
            <SectionBand key={shelf.key}>
              <RecentSection shelf={{ ...shelf, items }} viewAllHref="/reads" />
            </SectionBand>,
          );
        } else {
          // Determine column count based on shelf type
          let cols: 2 | 3 | 4 = 4; // default
          if (shelf.key === 'opportunities' || shelf.key === 'hotels' || shelf.key === 'events' || shelf.key === 'places' || shelf.key === 'restaurants') {
            cols = 3;
          } else if (shelf.key === 'reads' || shelf.key === 'must-read') {
            cols = 2;
          }

          blocks.push(
            <SectionBand key={shelf.key} tone={SURFACE_BANDS.has(shelf.key) ? 'surface' : 'plain'}>
              <Shelf
                shelf={shelf}
                viewAllHref={VIEW_ALL[shelf.key]}
                cols={cols}
              />
            </SectionBand>,
          );
        }

        // Prototype places the pull-quote between Startups and Events.
        if (shelf.key === 'startups') {
          blocks.push(
            <SectionBand key="testimonial" tone="pink">
              <TestimonialBlock />
            </SectionBand>,
          );
        }

        return blocks;
      })}

      <SectionBand>
        <ExploreAll items={allItems} />
      </SectionBand>

      <SectionBand tone="plain">
        <NewsletterSignup />
      </SectionBand>

      <SectionBand tone="surface">
        <SecondaryPromo />
      </SectionBand>
    </div>
  );
}
