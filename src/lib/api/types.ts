/**
 * Hand-written API types — enough to build against today.
 *
 * When the backend is running, `npm run api:types` regenerates
 * `schema.d.ts` from its OpenAPI spec; migrate these to `import type` from
 * that file once it's wired up.
 */

export type ContentType =
  | 'RESTAURANT'
  | 'HOTEL'
  | 'EVENT'
  | 'SONG'
  | 'VIDEO'
  | 'STARTUP'
  | 'BUSINESS'
  | 'CHURCH'
  | 'OPPORTUNITY'
  | 'READ';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Ref {
  id: string;
  name: string;
  slug?: string;
}

export interface MediaRef {
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Slim detail slices carried on card payloads (see backend contentCardSelect). */
export interface CardDetails {
  hotel?: {
    rating?: number | null;
    reviewCount?: number | null;
    ratingSource?: string | null;
    ratingRankLabel?: string | null;
    priceRange?: string | null;
    pricePerNightFrom?: number | null;
    currency?: string | null;
    neighbourhood?: string | null;
  } | null;
  restaurant?: {
    rating?: number | null;
    reviewCount?: number | null;
    ratingSource?: string | null;
    ratingRankLabel?: string | null;
    priceRange?: string | null;
    cuisines?: string[];
    neighbourhood?: string | null;
  } | null;
  event?: {
    startDateTime?: string | null;
    venueName?: string | null;
    neighbourhood?: string | null;
    isFree?: boolean;
    priceFrom?: number | null;
    currency?: string | null;
  } | null;
  song?: { artist?: string | null; genre?: string[]; isAlbum?: boolean } | null;
  video?: { creatorName?: string | null; durationSeconds?: number | null } | null;
  startup?: {
    sector?: string[];
    stage?: string | null;
    ycBatch?: string | null;
    startupStatus?: string | null;
  } | null;
  business?: { sector?: string[]; hqCity?: string | null } | null;
  church?: {
    eventDate?: string | null;
    venueName?: string | null;
    neighbourhood?: string | null;
  } | null;
  opportunity?: {
    opportunityType?: string | null;
    deadline?: string | null;
    locationType?: string | null;
    isRemote?: boolean;
    organiser?: string | null;
  } | null;
}

export interface ContentCard extends CardDetails {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt?: string | null;
  publishDate?: string | null;
  featured: boolean;
  viewCount: number;
  coverImage?: MediaRef | null;
  cities: Ref[];
  tags: Ref[];
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state?: string | null;
  isVirtual: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface HomepageShelf {
  key: string;
  title: string;
  items: ContentCard[];
}

export interface SessionUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'CONTRIBUTOR';
}
