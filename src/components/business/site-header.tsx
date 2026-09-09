import Link from 'next/link';
import { getCities } from '@/lib/api/content';

const NAV = [
  { label: "What's New", href: '/new' },
  { label: 'Places', href: '/hotels' },
  { label: 'Events', href: '/events' },
  { label: 'Music', href: '/songs' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Reads', href: '/reads' },
];

export async function SiteHeader() {
  const cities = await getCities().catch(() => []);

  return (
    <header className="border-line bg-surface border-b">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Whatsnew<span className="text-brand-600">.ng</span>
        </Link>

        {cities.length > 0 && (
          <select
            className="border-line bg-canvas rounded-md border px-2 py-1 text-sm"
            defaultValue=""
            aria-label="Choose a city"
          >
            <option value="">Everywhere</option>
            {cities
              .filter((c) => !c.isVirtual)
              .map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </select>
        )}

        <nav className="text-muted hidden gap-4 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/subscribe"
          className="bg-brand-600 hover:bg-brand-700 ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-white"
        >
          Subscribe
        </Link>
      </div>
    </header>
  );
}
