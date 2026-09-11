import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { CONTENT_PATHS, listContent, type ContentPath } from '@/lib/api/content';
import { apiGet } from '@/lib/api/client';

const STATIC_PATHS = [
  '',
  'about',
  'privacy',
  'terms',
  'work-with-us',
  'contact',
  'subscribe',
];

type TagRef = { slug: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, '');
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}/${p}`.replace(/\/$/, '') || base,
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'monthly',
  }));

  const paths = Object.values(CONTENT_PATHS) as ContentPath[];

  // Section index pages
  for (const path of paths) {
    entries.push({ url: `${base}/${path}`, lastModified: now, changeFrequency: 'daily' });
  }

  // Published items per type
  const perType = await Promise.all(
    paths.map((path) =>
      listContent(path, { status: 'PUBLISHED', limit: 200 })
        .then((r) => r.data.map((c) => ({ path, slug: c.slug, at: c.publishDate })))
        .catch(() => []),
    ),
  );
  for (const item of perType.flat()) {
    entries.push({
      url: `${base}/${item.path}/${item.slug}`,
      lastModified: item.at ? new Date(item.at) : now,
      changeFrequency: 'weekly',
    });
  }

  // Tag pages
  const tags = await apiGet<TagRef[]>('/tags', { next: { revalidate: 3600 } }).catch(() => []);
  for (const t of tags) {
    entries.push({ url: `${base}/tag/${t.slug}`, lastModified: now, changeFrequency: 'weekly' });
  }

  return entries;
}
