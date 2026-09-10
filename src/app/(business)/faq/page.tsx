import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'How Whatsnew.ng works — how we pick what runs, when the newsletter goes out, how to submit a listing, and how to get in touch.',
  alternates: { canonical: '/faq' },
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is Whatsnew.ng?',
    a: (
      <>
        A weekly guide to what&apos;s genuinely new in Nigeria — new restaurants, hotels, events,
        music, video, startups, businesses, faith events, opportunities and long-form reads,
        organised by city. Everything is curated by our team; there are no public accounts,
        comments or reviews.
      </>
    ),
  },
  {
    q: 'How do you decide what gets listed?',
    a: (
      <>
        A person chooses every item. We only run things that are genuinely new for the year, and we
        check each entry against an official announcement or the business directly before it goes
        live — keeping the source link wherever we can. Nothing from the public submission form is
        published automatically.
      </>
    ),
  },
  {
    q: 'When does the newsletter go out?',
    a: (
      <>
        Once a week, on Wednesday morning (West Africa Time). Each issue is the shortlist of what was
        added that week.{' '}
        <Link href="/subscribe" className="text-brand-600 hover:underline">
          Subscribe here
        </Link>
        .
      </>
    ),
  },
  {
    q: 'How do I unsubscribe?',
    a: (
      <>
        Every newsletter has an unsubscribe link at the bottom that takes effect immediately. No
        login or reply needed.
      </>
    ),
  },
  {
    q: 'How do I submit a place, launch or event?',
    a: (
      <>
        Use the{' '}
        <Link href="/submit" className="text-brand-600 hover:underline">
          submission form
        </Link>
        . It&apos;s free. An editor reviews every submission — being submitted doesn&apos;t
        guarantee a listing, and we may edit details for accuracy.
      </>
    ),
  },
  {
    q: 'Does it cost anything to be listed?',
    a: <>No. Editorial listings are free and are never paid placements. Sponsored formats, when we run them, are always labelled.</>,
  },
  {
    q: 'Which cities do you cover?',
    a: (
      <>
        All 36 states and the FCT. Coverage is deepest in the larger hubs — Lagos, Abuja, Port
        Harcourt, Ibadan, Kano and Enugu — and grows as we find more. Use the Location menu to filter
        by state.
      </>
    ),
  },
  {
    q: 'Something in a listing is wrong or out of date.',
    a: (
      <>
        Prices, dates and opening hours are set by third parties and change often. If you spot
        something off,{' '}
        <Link href="/contact" className="text-brand-600 hover:underline">
          tell us
        </Link>{' '}
        and we&apos;ll fix or remove it.
      </>
    ),
  },
  {
    q: 'Can we advertise or partner with you?',
    a: (
      <>
        Yes — newsletter placements, sponsorships and city guides. See{' '}
        <Link href="/work-with-us" className="text-brand-600 hover:underline">
          Work with us
        </Link>{' '}
        for the options.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-line border-b pb-6">
        <p className="text-brand-600 text-[13px] font-semibold uppercase tracking-wide">Help</p>
        <h1 className="font-heading text-ink mt-1 text-3xl font-bold sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="text-muted mt-3 text-[15px]">
          How Whatsnew.ng works. Still stuck?{' '}
          <Link href="/contact" className="text-brand-600 hover:underline">
            Get in touch
          </Link>
          .
        </p>
      </header>

      <dl className="mt-2 divide-y divide-[--color-line]">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <dt className="text-ink text-[16px] font-semibold">{q}</dt>
              <span className="text-muted mt-0.5 shrink-0 transition group-open:rotate-45" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <dd className="text-muted mt-3 text-[15px] leading-relaxed">{a}</dd>
          </details>
        ))}
      </dl>
    </div>
  );
}
