import Image from 'next/image';
import Link from 'next/link';
import type { HomepageShelf } from '@/lib/api/types';
import { CONTENT_PATHS } from '@/lib/api/content';
import { CoverFallback, PlayBadge } from './cover-fallback';
import { ShelfHeading } from './shelf';
import { streamingThumbnail } from '@/lib/utils/card-thumbnail';

/**
 * "Most Recent": a balanced 50/50 split - one large lead card on the left with
 * the headline over the image, four compact cards evenly stacked on the right.
 */
export function RecentSection({ shelf, viewAllHref }: { shelf: HomepageShelf; viewAllHref?: string }) {
  if (shelf.items.length === 0) return null;

  const [lead, ...rest] = shelf.items;
  const list = rest.slice(0, 4);
  const leadHref = `/${CONTENT_PATHS[lead.type]}/${lead.slug}`;
  const leadCover = lead.coverImage?.url || streamingThumbnail(lead);

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
  const label = (type: string) => TYPE_LABELS[type] ?? type;

  return (
    <section>
      <ShelfHeading title={shelf.title} viewAllHref={viewAllHref} />

      <div className="grid gap-6 lg:grid-cols-5 lg:items-stretch">
        {/* Lead */}
        <Link
          href={leadHref}
          className="group relative min-h-[360px] overflow-hidden rounded-2xl lg:col-span-3"
        >
          <div className="bg-ink absolute inset-0">
            {leadCover ? (
              <Image
                src={leadCover}
                alt={lead.coverImage?.alt ?? lead.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition duration-300 group-hover:scale-105"
                priority
              />
            ) : (
              <CoverFallback />
            )}
            {(lead.type === 'VIDEO' || lead.type === 'SONG') && <PlayBadge />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="relative flex h-full flex-col justify-end p-6">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-white/80">
              {label(lead.type)}
            </span>
            <h3 className="font-heading mt-1.5 max-w-xl text-2xl leading-tight font-bold text-white sm:text-[28px]">
              {lead.title}
            </h3>
            {lead.excerpt && (
              <p className="mt-2 line-clamp-2 max-w-lg text-[15px] leading-relaxed text-white/90">
                {lead.excerpt}
              </p>
            )}
          </div>
        </Link>

        {/* Four compact cards, evenly filling the same height */}
        <ul className="divide-line bg-surface flex flex-col divide-y overflow-hidden rounded-2xl lg:col-span-2">
          {list.map((item) => (
            <li key={item.id} className="flex-1">
              <Link
                href={`/${CONTENT_PATHS[item.type]}/${item.slug}`}
                className="hover:bg-canvas group flex h-full items-center gap-4 p-4 transition"
              >
                <div className="bg-canvas relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg">
                  {item.coverImage?.url || streamingThumbnail(item) ? (
                    <Image
                      src={(item.coverImage?.url || streamingThumbnail(item)) as string}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <CoverFallback className="[&_img]:h-5 sm:[&_img]:h-6" />
                  )}
                  {(item.type === 'VIDEO' || item.type === 'SONG') && <PlayBadge compact />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-muted text-[12px] font-semibold uppercase tracking-wide">
                    {label(item.type)}
                  </div>
                  <div className="font-heading text-ink group-hover:text-brand-600 mt-1 line-clamp-2 text-[15px] font-bold leading-snug transition">
                    {item.title}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
