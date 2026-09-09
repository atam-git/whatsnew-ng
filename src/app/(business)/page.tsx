import { getHomepage } from '@/lib/api/content';
import { Shelf } from '@/components/business/shelf';
import { FeaturedArticle } from '@/components/business/featured-article';
import { NewsletterSignup } from '@/components/business/newsletter-signup';
import { DUMMY_SHELVES, DUMMY_FEATURED } from '@/lib/data/dummy';

// Homepage. Shelves + ordering are curated in the CMS (homepage singleton),
// resolved server-side by the backend's /homepage endpoint.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  
  // Try to get real data, fall back to dummy data for development
  const shelves = await getHomepage(city).catch(() => DUMMY_SHELVES);
  const allItems = shelves.flatMap((s) => s.items);
  const featured = allItems.find((item) => item.featured) ?? allItems[0] ?? DUMMY_FEATURED;

  return (
    <div className="space-y-14">
      <FeaturedArticle item={featured} />

      {shelves.map((shelf) => (
        <Shelf key={shelf.key} shelf={shelf} />
      ))}

      <NewsletterSignup />
    </div>
  );
}
