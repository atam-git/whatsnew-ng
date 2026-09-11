import Image from 'next/image';
import Link from 'next/link';
import type { ContentCard } from '@/lib/api/types';
import { CONTENT_PATHS } from '@/lib/api/content';
import { CoverFallback, PlayBadge } from './cover-fallback';
import { formatDate } from '@/lib/utils/format';
import { streamingThumbnail } from '@/lib/utils/card-thumbnail';

// Human label per content type.
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
  READ: 'Read',
};

export function FeaturedArticle({ item }: { item: ContentCard }) {
  const href = `/${CONTENT_PATHS[item.type]}/${item.slug}`;
  const categoryLabel = TYPE_LABELS[item.type] ?? item.type;
  const categoryHref = `/${CONTENT_PATHS[item.type]}`;
  
  // Get cover image URL (uploaded image or streaming service thumbnail)
  const coverImageUrl = item.coverImage?.url || streamingThumbnail(item);

  return (
    <section className="flex flex-col gap-6">
      <p className="text-muted animate-in fade-in slide-in-from-bottom-3 duration-500 text-xs font-semibold tracking-[0.04em] uppercase">
        Featured Article
      </p>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="flex flex-col gap-3.5 lg:col-span-5 animate-in fade-in slide-in-from-left-8 duration-700">
          <Link
            href={categoryHref}
            className="text-brand-700 w-fit text-[15px] font-semibold tracking-[0.02em] transition-colors hover:text-brand-600 hover:underline"
          >
            {categoryLabel}
          </Link>
          <Link href={href} className="group">
            <h2 className="font-heading text-ink group-hover:text-brand-600 text-3xl leading-[1.12] font-bold tracking-tight transition-colors duration-300 sm:text-4xl lg:text-[42px]">
              {item.title}
            </h2>
          </Link>
          {item.excerpt && (
            <p className="text-muted-700 max-w-lg text-[17px] leading-relaxed">{item.excerpt}</p>
          )}
          {item.publishDate && (
            <span className="text-muted text-sm">{formatDate(item.publishDate, 'd MMMM yyyy')}</span>
          )}
        </div>

        <Link
          href={href}
          className="bg-canvas group relative block aspect-video overflow-hidden rounded-2xl lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-700"
        >
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={item.coverImage?.alt ?? item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <CoverFallback />
          )}
          {(item.type === 'VIDEO' || item.type === 'SONG') && <PlayBadge />}
        </Link>
      </div>
    </section>
  );
}
