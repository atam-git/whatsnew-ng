import Link from 'next/link';

const GROUPS = [
  {
    heading: 'Discover',
    links: [
      { label: "What's New", href: '/new' },
      { label: 'Hotels', href: '/hotels' },
      { label: 'Restaurants', href: '/restaurants' },
      { label: 'Events', href: '/events' },
      { label: 'Startups', href: '/startups' },
      { label: 'Opportunities', href: '/opportunities' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'How we pick', href: '/how-we-pick' },
      { label: 'Submit a listing', href: '/submit' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Editorial guidelines', href: '/editorial-guidelines' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-line bg-surface mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-base font-bold">Whatsnew.ng</div>
          <p className="text-muted mt-2 text-sm">One email, every Wednesday.</p>
        </div>
        {GROUPS.map((group) => (
          <div key={group.heading}>
            <div className="text-sm font-semibold">{group.heading}</div>
            <ul className="text-muted mt-2 space-y-1 text-sm">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-line text-muted border-t py-4 text-center text-xs">
        © {new Date().getFullYear()} Whatsnew.ng
      </div>
    </footer>
  );
}
