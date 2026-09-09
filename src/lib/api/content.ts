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

export const getHomepage = (city?: string) =>
  apiGet<HomepageShelf[]>(`/homepage${city ? `?city=${city}` : ''}`, {
    next: { revalidate: 60, tags: ['homepage'] },
  });

export const getCities = () =>
  apiGet<City[]>('/cities?activeOnly=true', { next: { revalidate: 300, tags: ['cities'] } });
