import Link from 'next/link';
import type { NavTree } from '@/lib/api/navigation';
import type { SiteSettings } from '@/lib/api/site-settings';

// Fallbacks used only if the CMS navigation is empty / unreachable.
const SECTIONS = [
  { label: "What's New", href: '/reads' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Events', href: '/events' },
  { label: 'Music', href: '/songs' },
  { label: 'Startups', href: '/startups' },
  { label: 'Opportunities', href: '/opportunities' },
];

const COMPANY = [
  { label: 'About us', href: '/about' },
  { label: 'Work with us', href: '/work-with-us' },
  { label: 'Submit a listing', href: '/submit' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL = [
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of use', href: '/terms' },
];

// Fallback used only when the settings endpoint is unreachable.
const SOCIAL = [
  { name: 'Facebook', href: 'https://facebook.com/whatsnewng', icon: 'facebook' },
  { name: 'Instagram', href: 'https://instagram.com/whatsnewng', icon: 'instagram' },
  { name: 'Twitter', href: 'https://twitter.com/whatsnewng', icon: 'twitter' },
  { name: 'TikTok', href: 'https://tiktok.com/@whatsnewng', icon: 'tiktok' },
  { name: 'YouTube', href: 'https://youtube.com/@whatsnewng', icon: 'youtube' },
];

const FALLBACK_EMAIL = 'hello@whatsnew.ng';
const FALLBACK_ADDRESS = 'Lagos, Nigeria';

/** Social links from the CMS settings (null field = hidden); constants only as
 *  a last-resort fallback when settings failed to load. */
function socialLinks(settings?: SiteSettings | null) {
  if (!settings) return SOCIAL;
  return (
    [
      ['Facebook', 'facebook', settings.facebookUrl],
      ['Instagram', 'instagram', settings.instagramUrl],
      ['Twitter', 'twitter', settings.twitterUrl],
      ['TikTok', 'tiktok', settings.tiktokUrl],
      ['YouTube', 'youtube', settings.youtubeUrl],
    ] as const
  )
    .filter(([, , href]) => !!href)
    .map(([name, icon, href]) => ({ name, icon, href: href as string }));
}

function SocialIcon({ icon }: { icon: string }) {
  const iconClass = "h-5 w-5";
  
  if (icon === 'facebook') {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  
  if (icon === 'instagram') {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
      </svg>
    );
  }
  
  if (icon === 'twitter') {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  
  if (icon === 'tiktok') {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    );
  }
  
  if (icon === 'youtube') {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  
  return null;
}

export function SiteFooter({ nav, settings }: { nav?: NavTree; settings?: SiteSettings | null }) {
  const pick = (items: { label: string; href: string; isExternal?: boolean }[] | undefined) =>
    items && items.length ? items.map((i) => ({ label: i.label, href: i.href })) : null;
  const sections = pick(nav?.FOOTER_PRIMARY) ?? SECTIONS;
  const company = pick(nav?.FOOTER_COMPANY) ?? COMPANY;
  const legal = pick(nav?.FOOTER_LEGAL) ?? LEGAL;

  const socials = socialLinks(settings);
  const email = settings?.contactEmail || FALLBACK_EMAIL;
  const address = settings ? settings.addressLine : FALLBACK_ADDRESS;
  const phone = settings?.phone ?? null;

  return (
    <footer className="bg-[#5c1f1f] mt-20 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Logo and Description */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center">
              <img
                src="/Whatsnew.ng.png"
                alt="Whatsnew.ng"
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/80">
              What&apos;s new in Nigeria — the places, people, releases and openings worth knowing about, updated every week.
            </p>
            <p className="mt-3 text-[15px] text-white/80">
              Whatsnew covers food, music, business and everything opening near you.
            </p>
            
            {/* Social Icons — real links come from CMS settings; the disabled
                "coming soon" buttons only show if settings failed to load. */}
            <div className="mt-6 flex gap-3">
              {settings
                ? socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      aria-label={social.name}
                    >
                      <SocialIcon icon={social.icon} />
                    </a>
                  ))
                : SOCIAL.map((social) => (
                    <button
                      key={social.name}
                      title="Coming soon"
                      className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      aria-label={`${social.name} - Coming soon`}
                    >
                      <SocialIcon icon={social.icon} />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-xs text-gray-900 opacity-0 transition group-hover:opacity-100">
                        Coming soon
                      </span>
                    </button>
                  ))}
            </div>
          </div>

          {/* Sections */}
          <div className="lg:col-span-2">
            <h3 className="text-[15px] font-bold uppercase tracking-wide text-white">
              Sections
            </h3>
            <ul className="mt-4 space-y-3">
              {sections.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-white/80 transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-[15px] font-bold uppercase tracking-wide text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-white/80 transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-[15px] font-bold uppercase tracking-wide text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-white/80 transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-[15px] font-bold uppercase tracking-wide text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              {address && (
                <li className="flex items-start gap-2 text-[15px] text-white/80">
                  <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{address}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href={`mailto:${email}`}
                  className="text-[15px] text-white/80 transition hover:text-white"
                >
                  {email}
                </a>
              </li>
              {phone && (
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-[15px] text-white/80 transition hover:text-white"
                  >
                    {phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} Whatsnew.ng. All rights reserved.</p>
          <p className="mt-2">
            Built with ❤️ by{' '}
            <a
              href="https://connectnigeria.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition"
            >
              connectnigeria.com
            </a>{' '}
            powered by Jesus Christ.
          </p>
        </div>
      </div>
    </footer>
  );
}
