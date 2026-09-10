import Image from 'next/image';
import Link from 'next/link';
import type { ContentCard as Card } from '@/lib/api/types';
import { CONTENT_PATHS } from '@/lib/api/content';
import { formatDate } from '@/lib/utils/format';
import { cardMeta } from '@/lib/utils/card-meta';
import { CardMetaRow } from './card-meta';

// Accent colour for the eyebrow label, per content type.
const TYPE_COLORS: Record<string, string> = {
  RESTAURANT: 'text-orange-600',
  HOTEL: 'text-blue-600',
  EVENT: 'text-purple-600',
  SONG: 'text-pink-600',
  VIDEO: 'text-red-600',
  STARTUP: 'text-green-600',
  BUSINESS: 'text-indigo-600',
  CHURCH: 'text-violet-600',
  OPPORTUNITY: 'text-amber-600',
  READ: 'text-teal-600',
};

// Human label per content type (fallback when the item has no tag).
const TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurant',
  HOTEL: 'Hotel',
  EVENT: 'Event',
  SONG: 'Music',
  VIDEO: 'Video',
  STARTUP: 'Startup',
  BUSINESS: 'New business',
  CHURCH: 'Faith',
  OPPORTUNITY: 'Opportunity',
  READ: 'Must read',
};

export function ContentCard({ item }: { item: Card }) {
  const href = `/${CONTENT_PATHS[item.type]}/${item.slug}`;
  const tag = item.tags?.[0];
  const eyebrow = tag?.name ?? TYPE_LABELS[item.type] ?? item.type;
  // A tag eyebrow filters by that tag; a type eyebrow browses the section.
  const eyebrowHref = tag?.slug ? `/tag/${tag.slug}` : `/${CONTENT_PATHS[item.type]}`;
  const eyebrowColor = TYPE_COLORS[item.type] || 'text-muted';
  const meta = cardMeta(item);

  return (
    <article className="group relative transition-transform duration-300 hover:-translate-y-1">
      <Link
        href={href}
        aria-hidden
        tabIndex={-1}
        className="bg-canvas relative block aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-md"
      >
        {item.coverImage?.url && (
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt ?? item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
      </Link>

      <div className="mt-3">
        <Link
          href={eyebrowHref}
          className={`relative z-10 inline-block text-[11px] font-bold uppercase tracking-[0.08em] transition-colors hover:opacity-80 hover:underline ${eyebrowColor}`}
        >
          {eyebrow}
        </Link>

        <h3 className="font-heading text-ink mt-1 text-[17px] font-bold leading-[1.3] tracking-tight">
          <Link
            href={href}
            className="group-hover:text-brand-600 line-clamp-2 transition-colors duration-200 after:absolute after:inset-0 after:content-['']"
          >
            {item.title}
          </Link>
        </h3>

        {meta ? (
          <CardMetaRow meta={meta} />
        ) : (
          <>
            {item.excerpt && (
              <p className="text-muted mt-1.5 line-clamp-2 text-[14px] leading-relaxed">
                {item.excerpt}
              </p>
            )}
            {item.publishDate && (
              <div className="text-muted/80 mt-2 text-[11px] font-semibold uppercase tracking-[0.06em]">
                {formatDate(item.publishDate, 'd MMM yyyy')}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
