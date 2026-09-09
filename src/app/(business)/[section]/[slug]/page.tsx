import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { CONTENT_PATHS, getContentBySlug, type ContentPath } from '@/lib/api/content';
import { formatDate } from '@/lib/utils/format';

const CONTENT_SECTIONS = new Set<string>(Object.values(CONTENT_PATHS));

interface ContentDetail {
  title: string;
  excerpt?: string | null;
  publishDate?: string | null;
  coverImage?: { url: string; alt?: string | null } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  externalUrl?: string | null;
}

async function load(section: string, slug: string): Promise<ContentDetail | null> {
  if (!CONTENT_SECTIONS.has(section)) return null;
  return getContentBySlug<ContentDetail>(section as ContentPath, slug).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}): Promise<Metadata> {
  const { section, slug } = await params;
  const item = await load(section, slug);
  if (!item) return {};
  return {
    title: item.seoTitle ?? item.title,
    description: item.seoDescription ?? item.excerpt ?? undefined,
  };
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const item = await load(section, slug);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
      {item.publishDate && (
        <div className="text-muted mt-1 text-sm">{formatDate(item.publishDate)}</div>
      )}
      {item.coverImage?.url && (
        <div className="bg-canvas relative mt-4 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt ?? item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
      {item.excerpt && <p className="text-muted mt-4 text-lg">{item.excerpt}</p>}
      {/* TODO: render Tiptap JSON body with a shared renderer */}
      {item.externalUrl && (
        <a
          href={item.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-600 mt-6 inline-block rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          Visit site
        </a>
      )}
    </article>
  );
}
