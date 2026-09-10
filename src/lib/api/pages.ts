import type { Metadata } from 'next';
import { apiGet } from './client';

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  body: unknown;
  /** Structured per-page content blocks (hero, cards, CTA…). Shape is per-slug. */
  data?: Record<string, unknown> | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt: string;
}

/** One of the fixed CMS-editable static pages, by slug. */
export const getPage = (slug: string) =>
  apiGet<StaticPage>(`/pages/${slug}`, { cache: 'no-store' });

/** `generateMetadata` helper for a static-page route. */
export async function pageMetadata(slug: string): Promise<Metadata> {
  const page = await getPage(slug).catch(() => null);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
  };
}
