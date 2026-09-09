import Link from 'next/link';
import { getCities } from '@/lib/api/content';

const NAV = [
  { label: "What's New", href: '/new' },
  { label: 'Places', href: '/hotels' },
  { label: 'Music', href: '/songs' },
  { label: 'Business', href: '/businesses' },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 6.75L9 11.25L13.5 6.75"
        stroke="currentColor"
        strokeWidth="1.6875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function SiteHeader() {
  const cities = await getCities().catch(() => []);
  const activeCities = cities.filter((c) => !c.isVirtual);

  return (
    <header className="border-line bg-surface border-b">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/d4abafef8ae07e0de7115621c4019545734d90dd?width=143"
            alt="Whatsnew.ng"
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {activeCities.length > 0 && (
            <div className="relative flex items-center">
              <select
                className="font-heading text-ink relative z-10 h-11 cursor-pointer appearance-none bg-transparent pr-6 text-[15px] font-bold outline-none"
                defaultValue=""
                aria-label="Choose a city"
              >
                <option value="">Lagos</option>
                {activeCities.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="text-ink pointer-events-none absolute right-0" />
            </div>
          )}

          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-heading text-ink hover:text-brand-600 text-[15px] font-bold transition"
            >
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            className="font-heading text-ink flex h-11 items-center gap-1.5 text-[15px] font-bold"
            aria-haspopup="true"
          >
            Categories
            <ChevronDownIcon />
          </button>
        </nav>

        <Link
          href="/subscribe"
          className="bg-brand-600 hover:bg-brand-700 inline-flex h-11 shrink-0 items-center justify-center rounded-full px-5 text-[15px] font-semibold text-white transition"
        >
          Subscribe
        </Link>
      </div>
    </header>
  );
}
