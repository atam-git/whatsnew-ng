import type { ContentCard } from './types';

export interface SearchResponse {
  data: ContentCard[];
  meta: { total: number; q: string; browse: boolean };
}

/**
 * Public content search. Relative URL so it goes through the Next `/api`
 * rewrite (same-origin) like the rest of the public-site client fetches.
 * An empty query returns recent published items (meta.browse = true).
 */
export async function searchContent(q: string, type?: string, limit = 30): Promise<SearchResponse> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (q.trim()) qs.set('q', q.trim());
  if (type) qs.set('type', type);
  const res = await fetch(`/api/v1/search?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  return res.json() as Promise<SearchResponse>;
}
