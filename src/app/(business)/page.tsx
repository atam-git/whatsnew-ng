import { getHomepage } from '@/lib/api/content';
import { Shelf } from '@/components/business/shelf';

// Homepage. Shelves + ordering are curated in the CMS (homepage singleton),
// resolved server-side by the backend's /homepage endpoint.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const shelves = await getHomepage(city).catch(() => []);

  return (
    <div>
      <section className="border-line bg-surface rounded-xl border p-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Everything new in Nigeria, weekly.</h1>
        <p className="text-muted mx-auto mt-2 max-w-xl">
          New restaurants and hotels, the songs and videos worth your time, startups that just
          launched, and openings near you.
        </p>
      </section>

      {shelves.length === 0 ? (
        <p className="text-muted mt-10 text-center">
          No published content yet. Add some in the CMS, then curate the homepage shelves.
        </p>
      ) : (
        shelves.map((shelf) => <Shelf key={shelf.key} shelf={shelf} />)
      )}
    </div>
  );
}
