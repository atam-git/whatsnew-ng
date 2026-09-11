'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ContentStatus, Paginated } from '@/lib/api/types';
import { cmsFetch } from './api';

// ── Content ──────────────────────────────────────────────────────────────────

export interface ContentRow {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: ContentStatus;
  publishDate?: string | null;
  featured: boolean;
  coverImage?: { url: string; alt?: string | null } | null;
  cities: { id: string; name: string; state?: string | null }[];
  tags: { id: string; name: string; slug?: string }[];
}

export function useContentList(type: string, params: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams(
    Object.entries({ limit: '100', ...params }).filter(([, v]) => v) as [string, string][],
  );
  return useQuery({
    queryKey: ['content', type, params],
    queryFn: () => cmsFetch<Paginated<ContentRow>>(`/${type}?${qs}`),
  });
}

export function useContentItem<T = Record<string, unknown>>(type: string, id: string) {
  return useQuery({
    queryKey: ['content', type, 'item', id],
    queryFn: () => cmsFetch<T>(`/${type}/${id}`),
    enabled: id !== 'new',
  });
}

export function useSaveContent(type: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: Record<string, unknown> }) =>
      id
        ? cmsFetch(`/${type}/${id}`, { method: 'PATCH', json: data })
        : cmsFetch(`/${type}`, { method: 'POST', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', type] }),
  });
}

export function useSetContentStatus(type: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      cmsFetch(`/${type}/${id}/status`, { method: 'PATCH', json: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', type] }),
  });
}

export function useDeleteContent(type: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/${type}/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', type] }),
  });
}

export function useFeaturedContent(excludeId?: string) {
  return useQuery({
    queryKey: ['featured-content', excludeId ?? ''],
    queryFn: async () => {
      const result = await cmsFetch<{ id: string; type: string; title: string } | null>(
        `/content/featured${excludeId ? `?excludeId=${excludeId}` : ''}`,
      );
      return result ?? null;
    },
    staleTime: 10_000,
    initialData: null,
  });
}

// ── Supporting lookups ───────────────────────────────────────────────────────

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () =>
      cmsFetch<{ id: string; name: string; slug: string; isVirtual: boolean }[]>('/cities'),
    staleTime: 300_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => cmsFetch<{ id: string; name: string; slug: string; kind: string }[]>('/tags'),
    staleTime: 60_000,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      cmsFetch<{ id: string; name: string; slug: string }>('/tags', {
        method: 'POST',
        json: { name },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

// ── Media ────────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  alt?: string | null;
  mimeType: string;
  width?: number | null;
  height?: number | null;
}

export function useMedia(q = '', kind?: 'image' | 'audio' | 'video') {
  return useQuery({
    queryKey: ['media', q, kind ?? 'all'],
    queryFn: () =>
      cmsFetch<Paginated<MediaItem>>(
        `/media?limit=60${q ? `&q=${encodeURIComponent(q)}` : ''}${kind ? `&kind=${kind}` : ''}`,
      ),
  });
}

/** presign → PUT to bucket → confirm → returns the Media row */
export async function uploadMedia(file: File): Promise<MediaItem> {
  const presign = await cmsFetch<{ key: string; uploadUrl: string }>('/media/presign', {
    method: 'POST',
    json: { mimeType: file.type, filename: file.name },
  });
  const put = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) throw new Error('Upload failed');
  return cmsFetch<MediaItem>('/media/confirm', {
    method: 'POST',
    json: { key: presign.key, mimeType: file.type, sizeBytes: file.size },
  });
}

// ── Live slug availability (CMS content editor) ──────────────────────────────

export interface SlugCheck {
  slug: string;
  available: boolean;
  suggestion: string;
  takenBy?: { type: string; title: string; status: string };
}

/**
 * Debounced check of whether `slug` is free. `type` is the content-type path.
 * `excludeId` is the current item (so editing without changing the slug is fine).
 * Returns `null` while idle / debouncing / for an empty slug.
 */
export function useSlugCheck(type: string, slug: string, excludeId?: string) {
  const [debounced, setDebounced] = useState(slug);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(slug.trim()), 350);
    return () => clearTimeout(t);
  }, [slug]);

  const query = useQuery({
    queryKey: ['slug-check', type, debounced, excludeId ?? ''],
    enabled: debounced.length > 0,
    staleTime: 10_000,
    queryFn: () =>
      cmsFetch<SlugCheck>(
        `/${type}/slug-check?slug=${encodeURIComponent(debounced)}` +
          (excludeId ? `&excludeId=${excludeId}` : ''),
      ),
  });

  return {
    data: debounced.length > 0 ? (query.data ?? null) : null,
    checking: query.isFetching && debounced.length > 0,
    pending: slug.trim() !== debounced,
  };
}
