import { notFound } from 'next/navigation';
import { getPage } from '@/lib/api/pages';
import { formatDate } from '@/lib/utils/format';
import { RichText, extractHeadings } from './rich-text';

/**
 * Shared shell for the plain legal / policy pages (Privacy, Terms). The whole
 * page is the CMS `body` - this just wraps it in a calm, readable layout with
 * an "on this page" contents list built from the body's headings.
 */
export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug).catch(() => null);
  if (!page || page.status !== 'PUBLISHED') notFound();

  const headings = extractHeadings(page.body).filter((h) => h.level <= 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header>
        <p className="text-brand-600 text-[13px] font-semibold uppercase tracking-wide">Legal</p>
        <h1 className="font-heading text-ink mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {page.title}
        </h1>
        {page.updatedAt && (
          <p className="text-muted mt-3 text-sm">Last updated {formatDate(page.updatedAt)}</p>
        )}
      </header>

      <div className="border-line mt-8 border-t pt-8 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
        {headings.length > 1 && (
          <nav aria-label="On this page" className="mb-8 lg:mb-0">
            <details className="lg:hidden" >
              <summary className="text-ink cursor-pointer text-sm font-semibold">On this page</summary>
              <ul className="mt-3 space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-muted hover:text-brand-700 text-sm">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            <div className="hidden lg:sticky lg:top-28 lg:block">
              <p className="text-muted mb-3 text-[11px] font-semibold uppercase tracking-wide">
                On this page
              </p>
              <ul className="space-y-2 border-l border-line">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="text-muted hover:text-brand-700 -ml-px block border-l border-transparent pl-3 text-[13px] leading-snug transition hover:border-brand-600"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}

        <article className="min-w-0 max-w-2xl">
          <RichText doc={page.body} className="" />
          <p className="border-line text-muted mt-12 border-t pt-6 text-sm">
            Questions about this page?{' '}
            <a
              href="mailto:hello@whatsnew.ng"
              className="text-brand-700 underline underline-offset-2"
            >
              hello@whatsnew.ng
            </a>
          </p>
        </article>
      </div>
    </div>
  );
}
