// Route-level loading UI - shown while navigating to /search before the client
// search component mounts. Mirrors the page's own skeleton.
export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-ink text-2xl font-bold sm:text-3xl">Search</h1>

      <div className="border-line mt-4 h-[50px] w-full animate-pulse rounded-xl border bg-surface" />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-line h-7 w-20 animate-pulse rounded-full" />
        ))}
      </div>

      <div className="mt-8">
        <div className="bg-line mb-4 h-3 w-40 animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-line overflow-hidden rounded-xl border">
              <div className="bg-line aspect-[16/10] w-full animate-pulse" />
              <div className="space-y-2 p-4">
                <div className="bg-line h-3 w-16 animate-pulse rounded" />
                <div className="bg-line h-4 w-4/5 animate-pulse rounded" />
                <div className="bg-line h-3 w-2/3 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
