import Link from 'next/link';

const SECTIONS = [
  { label: 'Reads', href: '/reads' },
  { label: 'Restaurants', href: '/restaurants' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Events', href: '/events' },
  { label: 'Music', href: '/songs' },
  { label: 'Startups', href: '/startups' },
  { label: 'Opportunities', href: '/opportunities' },
];

/** Shared body for both the root 404 and the (business) 404. */
export function NotFoundContent({ standalone = false }: { standalone?: boolean }) {
  return (
    <div
      className={
        standalone
          ? 'mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center'
          : 'mx-auto flex max-w-xl flex-col items-center py-16 text-center sm:py-24'
      }
    >
      <p className="font-heading text-brand-600 text-[64px] font-extrabold leading-none sm:text-[88px]">
        404
      </p>
      <h1 className="text-ink mt-2 text-xl font-bold sm:text-2xl">This page has moved on</h1>
      <p className="text-muted mt-3 text-[15px] leading-relaxed">
        The link is broken or the thing it pointed to is no longer here. It happens - new places
        open, old ones close.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="bg-brand-600 hover:bg-brand-700 inline-flex h-11 items-center rounded-full px-6 text-[15px] font-semibold text-white transition"
        >
          Back to home
        </Link>
        <Link
          href="/search"
          className="border-line text-ink hover:border-brand-300 inline-flex h-11 items-center rounded-full border px-6 text-[15px] font-semibold transition"
        >
          Search
        </Link>
      </div>

      <div className="border-line mt-10 w-full border-t pt-6">
        <p className="text-muted mb-3 text-[12px] font-semibold uppercase tracking-wide">
          Or browse a section
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="border-line text-muted hover:border-brand-300 hover:text-ink rounded-full border px-3 py-1 text-[13px] transition"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
