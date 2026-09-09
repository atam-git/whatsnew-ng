import Image from 'next/image';
import Link from 'next/link';
import type { ContentCard as Card } from '@/lib/api/types';
import { CONTENT_PATHS } from '@/lib/api/content';
import { formatDate } from '@/lib/utils/format';

export function ContentCard({ item }: { item: Card }) {
  const href = `/${CONTENT_PATHS[item.type]}/${item.slug}`;

  return (
    <Link
      href={href}
      className="group border-line bg-surface block overflow-hidden rounded-lg border transition hover:shadow-md"
    >
      <div className="bg-canvas relative aspect-[16/10]">
        {item.coverImage?.url && (
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt ?? item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <div className="text-muted text-xs tracking-wide uppercase">
          {item.categories[0]?.name ?? item.type.toLowerCase()}
        </div>
        <div className="group-hover:text-brand-600 mt-1 line-clamp-2 font-semibold">
          {item.title}
        </div>
        {item.excerpt && <p className="text-muted mt-1 line-clamp-2 text-sm">{item.excerpt}</p>}
        {item.publishDate && (
          <div className="text-muted mt-2 text-xs">{formatDate(item.publishDate)}</div>
        )}
      </div>
    </Link>
  );
}
