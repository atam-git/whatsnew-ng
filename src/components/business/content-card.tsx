import Image from 'next/image';
import Link from 'next/link';
import type { ContentCard as Card } from '@/lib/api/types';
import { CONTENT_PATHS } from '@/lib/api/content';
import { formatDate } from '@/lib/utils/format';

export function ContentCard({ item }: { item: Card }) {
  const href = `/${CONTENT_PATHS[item.type]}/${item.slug}`;
  const categoryLabel = item.categories[0]?.name ?? item.type.replace('_', ' ').toLowerCase();

  return (
    <Link href={href} className="group block">
      <div className="bg-canvas relative aspect-[4/3] overflow-hidden rounded-xl">
        {item.coverImage?.url && (
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt ?? item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 space-y-1">
        <div className="text-muted text-[13px] font-medium uppercase tracking-wide">
          {categoryLabel}
        </div>
        <h3 className="font-heading text-ink group-hover:text-brand-600 line-clamp-2 text-base font-bold leading-snug transition">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="text-muted line-clamp-2 text-[14px] leading-relaxed">{item.excerpt}</p>
        )}
        {item.publishDate && (
          <div className="text-muted pt-1 text-xs">{formatDate(item.publishDate)}</div>
        )}
      </div>
    </Link>
  );
}
