import { apiGet } from './client';
import type { City, ContentCard, HomepageShelf, Paginated } from './types';

/** URL path segment per content type (matches backend controllers). */
export const CONTENT_PATHS = {
  RESTAURANT: 'restaurants',
  HOTEL: 'hotels',
  EVENT: 'events',
  SONG: 'songs',
  VIDEO: 'videos',
  STARTUP: 'startups',
  BUSINESS: 'businesses',
  CHURCH: 'churches',
  OPPORTUNITY: 'opportunities',
  READ: 'reads',
} as const;

export type ContentPath = (typeof CONTENT_PATHS)[keyof typeof CONTENT_PATHS];

export function listContent(
  path: ContentPath,
  params: Record<string, string | number | undefined> = {},
) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  );
  return apiGet<Paginated<ContentCard>>(`/${path}?${qs.toString()}`, {
    next: { revalidate: 60, tags: [path] },
  });
}

export const getContentBySlug = <T = unknown>(path: ContentPath, slug: string) =>
  apiGet<T>(`/${path}/slug/${slug}`, { next: { revalidate: 60, tags: [`${path}:${slug}`] } });

export const getHomepage = (city?: string, state?: string) => {
  const qs = new URLSearchParams();
  if (city) qs.set('city', city);
  if (state) qs.set('state', state);
  const q = qs.toString();
  return apiGet<HomepageShelf[]>(`/homepage${q ? `?${q}` : ''}`, {
    next: { revalidate: 60, tags: ['homepage'] },
  });
};

export const getCities = () =>
  apiGet<City[]>('/cities?activeOnly=true', { next: { revalidate: 300, tags: ['cities'] } });

/** Distinct states that currently have published content — for the header filter. */
export const getStates = () =>
  apiGet<string[]>('/cities/states', { next: { revalidate: 300, tags: ['states'] } });

export interface TagRef {
  id: string;
  name: string;
  slug: string;
  kind: string;
  description?: string | null;
}

/** Published content (any type) carrying a tag. */
export const getTagContent = (slug: string, page = 1) =>
  apiGet<{ tag: TagRef } & Paginated<ContentCard>>(
    `/tags/${slug}/content?page=${page}&limit=24`,
    { next: { revalidate: 60, tags: [`tag:${slug}`] } },
  );
