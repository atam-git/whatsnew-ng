import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CONTENT_PATHS, getContentBySlug, listContent, type ContentPath } from '@/lib/api/content';
import { env } from '@/lib/env';
import { formatDate } from '@/lib/utils/format';
import { BackButton } from '@/components/business/back-button';
import { ContentCard } from '@/components/business/content-card';
import { NewsletterSignup } from '@/components/business/newsletter-signup';
import { RichText } from '@/components/business/rich-text';
import { ContentFacts } from '@/components/business/content-facts';
import { SongEmbed, VideoEmbed } from '@/components/business/media-embed';

const CONTENT_SECTIONS = new Set<string>(Object.values(CONTENT_PATHS));

// Map section paths to display names
const SECTION_LABELS: Record<string, string> = {
  restaurants: 'Restaurant',
  hotels: 'Hotel',
  events: 'Event',
  songs: 'Music',
  videos: 'Video',
  startups: 'Startup',
  businesses: 'New business',
  churches: 'Church',
  opportunities: 'Opportunity',
  reads: 'Must read',
};

interface ContentDetail {
  title: string;
  excerpt?: string | null;
  publishDate?: string | null;
  source?: string | null;
  coverImage?: { url: string; alt?: string | null } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  externalUrl?: string | null;
  sourceUrl?: string | null;
  body?: unknown;
  tags?: Array<{ name: string; slug: string }> | null;
  gallery?: Array<{
    media: { url: string; alt?: string | null; width?: number | null; height?: number | null };
  }> | null;
  read?: {
    author?: string | null;
    authorTitle?: string | null;
  } | null;
  video?: {
    videoUrl?: string | null;
    videoId?: string | null;
    platform?: string | null;
  } | null;
  song?: {
    spotifyUrl?: string | null;
    spotifyId?: string | null;
    youtubeUrl?: string | null;
    previewAudioUrl?: string | null;
  } | null;
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
  const title = item.seoTitle ?? item.title;
  const description = item.seoDescription ?? item.excerpt ?? undefined;
  const images = item.coverImage?.url
    ? [{ url: item.coverImage.url, alt: item.coverImage.alt ?? item.title }]
    : [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Whatsnew.ng' }];
  return {
    title,
    description,
    alternates: { canonical: `/${section}/${slug}` },
    openGraph: {
      type: section === 'reads' ? 'article' : 'website',
      title,
      description,
      url: `/${section}/${slug}`,
      images,
      ...(item.publishDate ? { publishedTime: item.publishDate } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: images?.map((i) => i.url) },
  };
}

function jsonLd(section: string, slug: string, item: ContentDetail) {
  const url = `${env.siteUrl.replace(/\/$/, '')}/${section}/${slug}`;
  const image = item.coverImage?.url ? [item.coverImage.url] : undefined;
  if (section === 'reads') {
    return {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: item.title,
      description: item.excerpt ?? undefined,
      image,
      datePublished: item.publishDate ?? undefined,
      author: item.read?.author ? { '@type': 'Person', name: item.read.author } : undefined,
      publisher: { '@type': 'Organization', name: 'Whatsnew.ng' },
      mainEntityOfPage: url,
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': section === 'events' || section === 'churches' ? 'Event' : 'WebPage',
    name: item.title,
    description: item.excerpt ?? undefined,
    image,
    url,
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

  const categoryLabel = SECTION_LABELS[section] || section;

  // Fetch related content from the same section
  const relatedContent = await listContent(section as ContentPath, { limit: 4 })
    .then((res) => res.data.filter((i) => i.slug !== slug).slice(0, 3))
    .catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(section, slug, item)) }}
      />
      {/* Back Button & Breadcrumb - aligned left */}
      <div className="mb-8 flex items-center gap-3 text-sm">
        <BackButton />
        <div className="flex items-center gap-2 text-gray-400">
          <Link href="/" className="hover:text-gray-600">
            Home
          </Link>
          <span>/</span>
          <Link href={`/${section}`} className="hover:text-gray-600">
            {categoryLabel}
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl">
        {/* Category → the section listing */}
        <Link
          href={`/${section}`}
          className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-red-600 hover:underline"
        >
          {categoryLabel}
        </Link>

      {/* Title */}
      <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {item.title}
      </h1>

      {/* Description/Excerpt */}
      {item.excerpt && (
        <p className="mt-4 text-[17px] leading-relaxed text-gray-700">{item.excerpt}</p>
      )}

      {/* Date */}
      {item.publishDate && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <time dateTime={item.publishDate}>{formatDate(item.publishDate)}</time>
        </div>
      )}

      {/* Playable media (video / music), when we can build a player */}
      {section === 'videos' && item.video && (
        <div className="mt-8">
          <VideoEmbed videoUrl={item.video.videoUrl} videoId={item.video.videoId} />
        </div>
      )}
      {section === 'songs' && item.song && (
        <div className="mt-8">
          <SongEmbed
            spotifyUrl={item.song.spotifyUrl}
            spotifyId={item.song.spotifyId}
            youtubeUrl={item.song.youtubeUrl}
            previewAudioUrl={item.song.previewAudioUrl}
          />
        </div>
      )}

      {/* Cover Image — skipped for videos where a player already renders */}
      {item.coverImage?.url && !(section === 'videos' && item.video) && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={item.coverImage.url}
            alt={item.coverImage.alt ?? item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Byline - authorship, not interactive */}
      {item.read?.author && (
        <p className="mt-5 flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            By <span className="font-medium text-gray-800">{item.read.author}</span>
            {item.read.authorTitle && <span className="text-gray-400"> · {item.read.authorTitle}</span>}
          </span>
        </p>
      )}

      {/* Tags (filter) + source (attribution) - visually distinct from each other */}
      {(item.tags?.length || item.source) && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-6">
          {item.tags?.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition hover:bg-red-100"
            >
              <span className="text-red-400">#</span>
              {tag.name}
            </Link>
          ))}

          {item.source &&
            (item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[13px] text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                via {item.source}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5m0 0v5m0-5L10 14M9 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4" />
                </svg>
              </a>
            ) : (
              <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-[13px] text-gray-500">
                via {item.source}
              </span>
            ))}
        </div>
      )}

      {/* Read at Source Button */}
      {item.externalUrl && (
        <div className="mt-6">
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-red-700"
          >
            Read it at the source
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}

      {/* Type-specific detail (rating, location, lineup, sector, …) */}
      <ContentFacts item={item} section={section} />

      {/* Article body (Tiptap JSON from the CMS) */}
      <RichText doc={item.body} />

      {/* Gallery */}
      {item.gallery && item.gallery.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold">Gallery</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {item.gallery.map((g, i) => (
              <div
                key={g.media.url}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
              >
                <Image
                  src={g.media.url}
                  alt={g.media.alt ?? `${item.title} - photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}
      </article>

      {/* More like this Section */}
      {relatedContent.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 font-heading text-2xl font-bold">More like this</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedContent.map((content) => (
              <ContentCard key={content.slug} item={content} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="mx-auto mt-16 max-w-5xl pb-16">
        <NewsletterSignup />
      </section>
    </div>
  );
}
