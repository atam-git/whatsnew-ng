import Link from 'next/link';

/**
 * Pull-quote band. In the prototype this floats between Startups and Events with
 * a stray "Hotels" tag — kept here as a design element, wired to the Hotels page.
 */
export function TestimonialBlock() {
  return (
    <div className="text-center">
      <p className="text-brand-700 text-[13px] font-semibold tracking-wide uppercase">
        From a recent stay
      </p>
      <blockquote className="font-heading text-ink mx-auto mt-4 max-w-2xl text-2xl leading-snug font-bold sm:text-[28px]">
        &ldquo;The hotel was very family friendly and felt safe. Their facilities looked clean and
        well maintained.&rdquo;
      </blockquote>
      <p className="text-muted mt-3 text-sm">Tripadvisor reviewer &middot; Eko Hotels &amp; Suites</p>
      <Link
        href="/hotels"
        className="bg-brand-600 hover:bg-brand-700 mt-6 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition"
      >
        Read more
      </Link>
    </div>
  );
}
