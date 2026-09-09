import Link from 'next/link';

const SECTIONS = [
  { label: "What's New", href: '/new' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Events', href: '/events' },
  { label: 'Music', href: '/songs' },
  { label: 'Startups', href: '/startups' },
  { label: 'Opportunities', href: '/opportunities' },
];

const COMPANY = [
  { label: 'About us', href: '/about' },
  { label: 'How we pick', href: '/how-we-pick' },
  { label: 'Submit a listing', href: '/submit' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Work with us', href: '/careers' },
];

const LEGAL = [
  { label: 'Editorial guidelines', href: '/guidelines' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of use', href: '/terms' },
];

const SOCIAL = [
  { label: 'Facebook', href: 'https://facebook.com/whatsnewng' },
  { label: 'Instagram', href: 'https://instagram.com/whatsnewng' },
  { label: 'Twitter', href: 'https://twitter.com/whatsnewng' },
  { label: 'TikTok', href: 'https://tiktok.com/@whatsnewng' },
  { label: 'YouTube', href: 'https://youtube.com/@whatsnewng' },
];

export function SiteFooter() {
  return (
    <footer className="border-line bg-surface mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/d4abafef8ae07e0de7115621c4019545734d90dd?width=143"
                alt="Whatsnew.ng"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-muted mt-4 text-sm leading-relaxed">
              Everything new in Nigeria, weekly.
            </p>
            <div className="mt-4">
              <p className="text-ink text-sm font-semibold">Contact</p>
              <p className="text-muted mt-1 text-sm">Lagos, Nigeria</p>
              <a
                href="mailto:hello@whatsnew.ng"
                className="text-brand-600 hover:text-brand-700 mt-1 block text-sm transition"
              >
                hello@whatsnew.ng
              </a>
            </div>
          </div>

          <div>
            <p className="font-heading text-ink text-sm font-bold uppercase tracking-wide">
              Sections
            </p>
            <ul className="mt-3 space-y-2">
              {SECTIONS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-ink text-sm transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-ink text-sm font-bold uppercase tracking-wide">
              Company
            </p>
            <ul className="mt-3 space-y-2">
              {COMPANY.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-ink text-sm transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-ink text-sm font-bold uppercase tracking-wide">
              Legal
            </p>
            <ul className="mt-3 space-y-2">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-ink text-sm transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-ink text-sm font-bold uppercase tracking-wide">
              Social
            </p>
            <ul className="mt-3 space-y-2">
              {SOCIAL.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-ink text-sm transition"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-line text-muted mt-10 border-t pt-6 text-center text-xs">
          © 2026 Whatsnew.ng. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
