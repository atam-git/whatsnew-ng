import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/api/pages';
import { RichText } from './rich-text';

/*
 * About page — designed layout. `title` and the story `body` come from the CMS
 * Pages editor; the structured blocks below come from `page.data` (also edited
 * in the CMS). These DEFAULTS are the fallback if a field is empty.
 */
const DEFAULTS = {
  heroLede:
    "A weekly guide to what's genuinely new in Nigeria — the places, releases, events and opportunities worth knowing about, city by city.",
  quickFacts: ['Every Wednesday', '9 cities', 'Curated, not crowdsourced'],
  coverItems: [
    { label: 'Restaurants & bars', desc: 'New tables, cafés and bars worth the trip.', href: '/restaurants' },
    { label: 'Hotels & stays', desc: 'Openings and standout stays, chain and independent.', href: '/hotels' },
    { label: 'Events', desc: 'Concerts, festivals and gatherings with confirmed dates.', href: '/events' },
    { label: 'Music & video', desc: 'New releases from Nigerian artists and creators.', href: '/songs' },
    { label: 'Startups & business', desc: 'New companies, funding and notable openings.', href: '/startups' },
    { label: 'Opportunities', desc: 'Jobs, grants, fellowships and scholarships.', href: '/opportunities' },
  ] as { label: string; desc: string; href: string }[],
  coverFootnote: 'Plus new businesses, video, faith events and long-form reads.',
  principlesHeading: 'Every item earns its place',
  principles: [
    {
      title: 'Curated, not crowdsourced',
      body: 'A person chooses every item. Nothing from the public submission form goes live on its own.',
    },
    {
      title: 'Checked against a primary source',
      body: 'We verify each entry against an official announcement or the business directly — and keep the link.',
    },
    {
      title: 'New means new',
      body: 'A genuinely new place, release or event for the year — not an old one that resurfaced in search.',
    },
  ] as { title: string; body: string }[],
  stats: [
    { value: '10', label: 'Categories', sub: 'From food to fellowships' },
    { value: '9', label: 'Cities', sub: 'Across Nigeria, and growing' },
    { value: 'Wed', label: 'Newsletter', sub: 'One email, every week' },
  ] as { value: string; label: string; sub: string }[],
  cta: {
    heading: "Never miss what's new",
    body: "One email every Wednesday with the week's openings, releases and opportunities.",
    buttonLabel: 'Subscribe to the newsletter',
    href: '/subscribe',
  },
};

function Bleed({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`relative left-1/2 w-screen -translate-x-1/2 ${className}`}>{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-brand-600 text-[13px] font-semibold uppercase tracking-wide">{children}</p>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick<T>(v: any, fallback: T): T {
  if (Array.isArray(fallback)) return (Array.isArray(v) ? v : fallback) as T;
  return (v === undefined || v === null || v === '' ? fallback : v) as T;
}

export async function AboutPage() {
  const page = await getPage('about').catch(() => null);
  if (!page || page.status !== 'PUBLISHED') notFound();

  const raw = (page.data ?? {}) as Record<string, unknown>;
  const heroLede = pick(raw.heroLede, DEFAULTS.heroLede);
  const quickFacts = pick(raw.quickFacts, DEFAULTS.quickFacts);
  const coverItems = pick(raw.coverItems, DEFAULTS.coverItems);
  const coverFootnote = pick(raw.coverFootnote, DEFAULTS.coverFootnote);
  const principlesHeading = pick(raw.principlesHeading, DEFAULTS.principlesHeading);
  const principles = pick(raw.principles, DEFAULTS.principles);
  const stats = pick(raw.stats, DEFAULTS.stats);
  const cta = { ...DEFAULTS.cta, ...((raw.cta as object) ?? {}) };

  return (
    <div>
      {/* Hero */}
      <Bleed className="bg-brand-50 border-brand-600/10 -mt-8 border-b">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <SectionLabel>About Whatsnew.ng</SectionLabel>
          <h1 className="font-heading text-ink mt-3 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="text-muted-700 mx-auto mt-5 max-w-2xl text-lg leading-8">{heroLede}</p>
          {quickFacts.length > 0 && (
            <div className="text-muted-700 mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
              {quickFacts.map((f, i) => (
                <span key={f} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-muted/50" aria-hidden>
                      ·
                    </span>
                  )}
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </Bleed>

      {/* Story — the editable rich-text body */}
      <section className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
        <SectionLabel>Our story</SectionLabel>
        <div className="[&>div]:mt-4">
          <RichText doc={page.body} />
        </div>
      </section>

      {/* What we cover */}
      {coverItems.length > 0 && (
        <Bleed className="bg-surface border-line border-y">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
            <div className="text-center">
              <h2 className="font-heading text-ink text-2xl font-bold tracking-tight sm:text-3xl">
                What we cover
              </h2>
              <p className="text-muted mx-auto mt-3 max-w-xl">
                Ten kinds of new, sorted by city and refreshed every week.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coverItems.map((item, i) => (
                <Link
                  key={item.href || i}
                  href={item.href || '#'}
                  className="group border-line bg-surface hover:border-brand-500/40 rounded-xl border p-6 transition hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-ink group-hover:text-brand-700 text-[15px] font-semibold transition">
                      {item.label}
                    </h3>
                    <span className="text-muted group-hover:text-brand-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                      →
                    </span>
                  </div>
                  <p className="text-muted mt-1.5 text-sm leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
            {coverFootnote && (
              <p className="text-muted mt-6 text-center text-sm">{coverFootnote}</p>
            )}
          </div>
        </Bleed>
      )}

      {/* How we pick */}
      {principles.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
          <SectionLabel>How we pick</SectionLabel>
          <h2 className="font-heading text-ink mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {principlesHeading}
          </h2>
          <ul className="divide-line mt-8 divide-y">
            {principles.map((p, i) => (
              <li key={p.title || i} className="flex gap-4 py-5">
                <span className="bg-brand-50 text-brand-600 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-ink font-semibold">{p.title}</p>
                  <p className="text-muted mt-1 text-[15px] leading-relaxed">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* By the numbers */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-14 sm:pb-20">
          <div className="border-line bg-surface divide-line grid grid-cols-3 divide-x overflow-hidden rounded-2xl border">
            {stats.map((s, i) => (
              <div key={s.label || i} className="px-4 py-7 text-center sm:px-6">
                <div className="font-heading text-brand-600 text-3xl font-bold">{s.value}</div>
                <div className="text-ink mt-1 text-sm font-medium">{s.label}</div>
                <div className="text-muted mt-0.5 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {cta.heading && (
        <Bleed className="bg-brand-600 -mb-8 text-white">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-20">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {cta.heading}
            </h2>
            {cta.body && (
              <p className="mx-auto mt-3 max-w-lg text-[17px] leading-8 text-white/85">{cta.body}</p>
            )}
            {cta.buttonLabel && (
              <Link
                href={cta.href || '/subscribe'}
                className="text-brand-700 mt-8 inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold transition hover:bg-brand-50"
              >
                {cta.buttonLabel}
              </Link>
            )}
          </div>
        </Bleed>
      )}
    </div>
  );
}
