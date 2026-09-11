import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPage } from '@/lib/api/pages';
import { RichText } from './rich-text';

/*
 * Work with Us - designed layout. `title` and the intro `body` come from the
 * CMS Pages editor; the structured blocks come from `page.data`. DEFAULTS below
 * are the fallback if a field is empty.
 */
const DEFAULTS = {
  heroLede:
    'Whatsnew.ng reaches people across Nigeria who are actively deciding where to go, what to see and what just launched. There are a few ways to work with us.',
  lanesHeading: 'Ways to work together',
  lanes: [
    {
      label: 'Partnerships & advertising',
      desc: 'Sponsorships, newsletter placements and city guides with brands and organisers. Tell us what you have in mind and your timing.',
      action: 'Email partnerships@whatsnew.ng',
      href: 'mailto:partnerships@whatsnew.ng',
      note: '',
    },
    {
      label: 'Write for us',
      desc: 'We commission reported features and essays about what is changing in Nigeria. Send a short pitch and two links to previous work.',
      action: 'Email editors@whatsnew.ng',
      href: 'mailto:editors@whatsnew.ng',
      note: '',
    },
  ] as { label: string; desc: string; action: string; href: string; note?: string }[],
  contactEmail: 'hello@whatsnew.ng',
  cta: {
    heading: 'Have something new?',
    body: 'Send it through and an editor will take a look.',
    buttonLabel: 'Get in touch',
    href: '/contact',
  },
};

function Bleed({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`relative left-1/2 w-screen -translate-x-1/2 ${className}`}>{children}</div>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick<T>(v: any, fallback: T): T {
  if (Array.isArray(fallback)) return (Array.isArray(v) ? v : fallback) as T;
  return (v === undefined || v === null || v === '' ? fallback : v) as T;
}

export async function WorkWithUsPage() {
  const page = await getPage('work-with-us').catch(() => null);
  if (!page || page.status !== 'PUBLISHED') notFound();

  const raw = (page.data ?? {}) as Record<string, unknown>;
  const heroLede = pick(raw.heroLede, DEFAULTS.heroLede);
  const lanesHeading = pick(raw.lanesHeading, DEFAULTS.lanesHeading);
  const lanes = pick(raw.lanes, DEFAULTS.lanes);
  const contactEmail = pick(raw.contactEmail, DEFAULTS.contactEmail);
  const cta = { ...DEFAULTS.cta, ...((raw.cta as object) ?? {}) };

  return (
    <div>
      {/* Hero */}
      <Bleed className="bg-brand-50 border-brand-600/10 -mt-8 border-b">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <p className="text-brand-600 text-[13px] font-semibold uppercase tracking-wide">
            Work with us
          </p>
          <h1 className="font-heading text-ink mt-3 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="text-muted-700 mx-auto mt-5 max-w-2xl text-lg leading-8">{heroLede}</p>
        </div>
      </Bleed>

      {/* Intro - editable body */}
      {page.body ? (
        <section className="mx-auto max-w-2xl px-4 py-14 sm:py-16">
          <RichText doc={page.body} className="" />
        </section>
      ) : null}

      {/* Lanes */}
      {lanes.length > 0 && (
        <Bleed className="bg-surface border-line border-y">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
            <h2 className="font-heading text-ink text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {lanesHeading}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {lanes.map((lane, i) => {
                const external = !lane.href?.startsWith('/');
                return (
                  <div
                    key={lane.label || i}
                    className="border-line bg-surface flex flex-col rounded-2xl border p-6"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-ink text-[15px] font-semibold">{lane.label}</h3>
                      {lane.note && (
                        <span className="bg-brand-50 text-brand-700 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          {lane.note}
                        </span>
                      )}
                    </div>
                    <p className="text-muted mt-2 flex-1 text-sm leading-relaxed">{lane.desc}</p>
                    {external ? (
                      <a
                        href={lane.href}
                        className="text-brand-700 mt-4 text-sm font-semibold hover:underline"
                      >
                        {lane.action} →
                      </a>
                    ) : (
                      <Link
                        href={lane.href}
                        className="text-brand-700 mt-4 text-sm font-semibold hover:underline"
                      >
                        {lane.action} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            {contactEmail && (
              <p className="text-muted mt-8 text-center text-sm">
                For anything else, email{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-brand-700 underline underline-offset-2"
                >
                  {contactEmail}
                </a>
                .
              </p>
            )}
          </div>
        </Bleed>
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
                href={cta.href || '/contact'}
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
