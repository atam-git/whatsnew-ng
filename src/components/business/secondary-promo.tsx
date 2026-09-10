import Link from 'next/link';

export function SecondaryPromo() {
  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-heading text-ink text-2xl font-bold tracking-tight sm:text-3xl">
          Everything new in Nigeria, weekly.
        </h2>
        <p className="text-muted mt-2 text-[15px]">
          New places, releases and openings - city by city.
        </p>
      </div>
      <Link
        href="/reads"
        className="bg-brand-600 hover:bg-brand-700 inline-flex shrink-0 items-center rounded-full px-6 py-3 text-sm font-semibold text-white transition"
      >
        Explore Whatsnew
      </Link>
    </div>
  );
}
