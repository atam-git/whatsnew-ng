'use client';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Paginated } from '@/lib/api/types';
import { cmsFetch } from './api';
import { CONTENT_TYPE_KEYS } from './content-schema';

// ── Dashboard: per-type counts ───────────────────────────────────────────────

export function useContentCounts() {
  return useQueries({
    queries: CONTENT_TYPE_KEYS.map((type) => ({
      queryKey: ['content-count', type],
      queryFn: () => cmsFetch<Paginated<unknown>>(`/${type}?limit=1`),
      staleTime: 30_000,
      select: (r: Paginated<unknown>) => r.meta.total,
    })),
    combine: (results) => ({
      byType: Object.fromEntries(
        CONTENT_TYPE_KEYS.map((t, i) => [t, results[i].data ?? 0]),
      ) as Record<string, number>,
      total: results.reduce((n, r) => n + (r.data ?? 0), 0),
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}

// ── Content search (for newsletter / homepage pickers) ───────────────────────

export interface PickerContent {
  id: string;
  type: string;
  title: string;
  status: string;
  publishDate?: string | null;
  coverImage?: { url: string } | null;
}

export function useContentSearch(q: string, type?: string) {
  return useQuery({
    queryKey: ['content-search', type ?? 'all', q],
    enabled: q.trim().length > 1,
    queryFn: async () => {
      const types = type ? [type] : CONTENT_TYPE_KEYS;
      const pages = await Promise.all(
        types.map((t) =>
          cmsFetch<Paginated<PickerContent>>(
            `/${t}?limit=8&q=${encodeURIComponent(q)}`,
          ).catch(() => ({ data: [] as PickerContent[], meta: { total: 0, page: 1, limit: 8, totalPages: 0 } })),
        ),
      );
      return pages.flatMap((p) => p.data).slice(0, 30);
    },
  });
}

// ── Media ────────────────────────────────────────────────────────────────────

export interface MediaRow {
  id: string;
  url: string;
  key: string;
  alt?: string | null;
  caption?: string | null;
  mimeType: string;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
}

export function useMediaLibrary(q: string) {
  return useQuery({
    queryKey: ['media', q],
    queryFn: () =>
      cmsFetch<Paginated<MediaRow>>(`/media?limit=100${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; alt?: string; caption?: string }) =>
      cmsFetch(`/media/${id}`, { method: 'PATCH', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/media/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

// ── Submissions ──────────────────────────────────────────────────────────────

export interface ListingRow {
  id: string;
  contentType: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string | null;
  status: string;
  payload: Record<string, unknown>;
  createdAt: string;
  promotedContentId?: string | null;
}

export function useListingSubmissions(status?: string) {
  return useQuery({
    queryKey: ['listing-submissions', status ?? 'all'],
    queryFn: () =>
      cmsFetch<Paginated<ListingRow>>(
        `/listing-submissions?limit=100${status ? `&status=${status}` : ''}`,
      ),
  });
}

export function usePromoteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      cmsFetch<{ contentId: string; type: string; slug: string }>(
        `/listing-submissions/${id}/promote`,
        { method: 'POST' },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listing-submissions'] }),
  });
}

export function useRejectListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      cmsFetch(`/listing-submissions/${id}/reject`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listing-submissions'] }),
  });
}

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export function useContacts(status?: string) {
  return useQuery({
    queryKey: ['contacts', status ?? 'all'],
    queryFn: () =>
      cmsFetch<Paginated<ContactRow>>(`/contact?limit=100${status ? `&status=${status}` : ''}`),
  });
}

export function useSetContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      cmsFetch(`/contact/${id}/status`, { method: 'PATCH', json: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

// ── Cities ───────────────────────────────────────────────────────────────────

export interface CityRow {
  id: string;
  name: string;
  slug: string;
  state?: string | null;
  timezone?: string | null;
  isVirtual: boolean;
  sortOrder: number;
  isActive: boolean;
}

export function useCitiesAdmin() {
  return useQuery({ queryKey: ['cities-admin'], queryFn: () => cmsFetch<CityRow[]>('/cities') });
}

export function useSaveCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CityRow> & { id?: string }) =>
      id
        ? cmsFetch(`/cities/${id}`, { method: 'PATCH', json: data })
        : cmsFetch('/cities', { method: 'POST', json: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cities-admin'] });
      qc.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/cities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cities-admin'] });
      qc.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

// ── Tags ─────────────────────────────────────────────────────────────────────

export type TagKind = 'READ_TAG' | 'CUISINE' | 'AMENITY' | 'INDUSTRY' | 'DENOMINATION' | 'GENERIC';

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  kind: TagKind;
  description?: string | null;
  sortOrder: number;
  contentCount: number;
  inMenu: boolean;
}

export function useAdminTags() {
  return useQuery({ queryKey: ['tags', 'admin'], queryFn: () => cmsFetch<AdminTag[]>('/tags') });
}

export function useSaveTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id?: string }) =>
      id
        ? cmsFetch<AdminTag>(`/tags/${id}`, { method: 'PATCH', json: data })
        : cmsFetch<AdminTag>('/tags', { method: 'POST', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/tags/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

// ── Pages ────────────────────────────────────────────────────────────────────

export interface PageRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  body?: unknown;
  data?: Record<string, unknown> | null;
  updatedAt: string;
}

export function usePages() {
  return useQuery({ queryKey: ['pages'], queryFn: () => cmsFetch<PageRow[]>('/pages') });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['pages', 'item', id],
    queryFn: async () => {
      const all = await cmsFetch<PageRow[]>('/pages');
      return all.find((p) => p.id === id) ?? null;
    },
  });
}

/** Static pages are edit-only - always a PATCH by id. */
export function useSavePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      cmsFetch<PageRow>(`/pages/${id}`, { method: 'PATCH', json: data }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['pages', 'item', v.id] });
    },
  });
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  cityScope: { id: string; name: string }[];
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => cmsFetch<UserRow[]>('/users') });
}

export function useSaveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id?: string }) =>
      id
        ? cmsFetch(`/users/${id}`, { method: 'PATCH', json: data })
        : cmsFetch('/users', { method: 'POST', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ── Newsletter ───────────────────────────────────────────────────────────────

export interface IssueRow {
  id: string;
  subject: string;
  previewText?: string | null;
  status: string;
  cityId?: string | null;
  scheduledFor?: string | null;
  sentAt?: string | null;
  intro?: unknown;
  recipientCount?: number | null;
  openCount?: number | null;
  clickCount?: number | null;
  createdAt: string;
  _count?: { items: number };
}

export interface IssueDetail extends IssueRow {
  items: {
    id: string;
    sortOrder: number;
    contentId: string;
    content: { id: string; type: string; title: string; slug: string; status: string };
  }[];
}

export function useIssues() {
  return useQuery({ queryKey: ['issues'], queryFn: () => cmsFetch<IssueRow[]>('/newsletter/issues') });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issues', 'item', id],
    enabled: id !== 'new',
    queryFn: () => cmsFetch<IssueDetail>(`/newsletter/issues/${id}`),
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      cmsFetch<IssueRow>('/newsletter/issues', { method: 'POST', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      cmsFetch<IssueRow>(`/newsletter/issues/${id}`, { method: 'PATCH', json: data }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issues', 'item', v.id] });
    },
  });
}

export function useIssueAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      body,
    }: {
      id: string;
      action: 'autofill' | 'schedule' | 'send';
      body?: Record<string, unknown>;
    }) => cmsFetch(`/newsletter/issues/${id}/${action}`, { method: 'POST', json: body }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issues', 'item', v.id] });
    },
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/newsletter/issues/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useSendTestIssue() {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) =>
      cmsFetch<{ ok: boolean; email: string }>(`/newsletter/issues/${id}/test`, {
        method: 'POST',
        json: email ? { email } : {},
      }),
  });
}

/** Same-origin URL for the rendered-email preview (open in a new tab). */
export const issuePreviewUrl = (id: string) => `/api/v1/newsletter/issues/${id}/preview`;

// ── Newsletter schedule (weekly auto-draft) ──────────────────────────────────

export interface NewsletterSettings {
  cron: string;
  timezone: string;
  enabled: boolean;
  nextRun: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export function useNewsletterSettings() {
  return useQuery({
    queryKey: ['newsletter-settings'],
    queryFn: () => cmsFetch<NewsletterSettings>('/newsletter/settings'),
  });
}

export function useSaveNewsletterSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { cron: string; timezone: string; enabled: boolean }) =>
      cmsFetch<NewsletterSettings>('/newsletter/settings', { method: 'PATCH', json: data }),
    onSuccess: (r) => qc.setQueryData(['newsletter-settings'], r),
  });
}

// ── Navigation ───────────────────────────────────────────────────────────────

export type NavGroup =
  | 'HEADER'
  | 'FOOTER_PRIMARY'
  | 'FOOTER_COMPANY'
  | 'FOOTER_LEGAL'
  | 'CITY_LIST'
  | 'CATEGORY_TABS';

export interface NavItemRow {
  id: string;
  group: NavGroup;
  label: string;
  href: string;
  sortOrder: number;
  isExternal: boolean;
  parentId?: string | null;
}

export function useNavItems() {
  return useQuery({ queryKey: ['nav'], queryFn: () => cmsFetch<NavItemRow[]>('/navigation/all') });
}

export function useSaveNavItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id?: string }) =>
      id
        ? cmsFetch(`/navigation/${id}`, { method: 'PATCH', json: data })
        : cmsFetch('/navigation', { method: 'POST', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nav'] }),
  });
}

export function useDeleteNavItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/navigation/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nav'] }),
  });
}

export function useReorderNav() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      cmsFetch('/navigation/reorder', { method: 'PATCH', json: { ids } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nav'] }),
  });
}

export function useSubscriberCount() {
  return useQuery({
    queryKey: ['subscribers', 'count'],
    queryFn: () => cmsFetch<Paginated<unknown>>('/newsletter/subscribers?limit=1'),
    select: (r) => r.meta.total,
    staleTime: 60_000,
  });
}

export interface SubscriberRow {
  id: string;
  email: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  source?: string | null;
  subscribedAt: string;
  unsubscribedAt?: string | null;
  city?: { id: string; name: string } | null;
}

export function useSubscribers(params: { status?: string; q?: string } = {}) {
  const qs = new URLSearchParams({ limit: '200' });
  if (params.status) qs.set('status', params.status);
  if (params.q) qs.set('q', params.q);
  return useQuery({
    queryKey: ['subscribers', 'list', params],
    queryFn: () => cmsFetch<Paginated<SubscriberRow>>(`/newsletter/subscribers?${qs}`),
  });
}

export function useAddSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; cityId?: string; source?: string }) =>
      cmsFetch('/newsletter/subscribers', { method: 'POST', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscribers'] }),
  });
}

export function useSetSubscriberStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      cmsFetch(`/newsletter/subscribers/${id}/status`, { method: 'PATCH', json: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscribers'] }),
  });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/newsletter/subscribers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscribers'] }),
  });
}

export const subscribersExportUrl = '/api/v1/newsletter/subscribers/export';

// ── Homepage shelves ─────────────────────────────────────────────────────────

export interface ShelfRow {
  id: string;
  key: string;
  title: string;
  mode: 'MANUAL' | 'AUTO_RECENT' | 'AUTO_POPULAR' | 'AUTO_TRENDING';
  cityId?: string | null;
  sortOrder: number;
  isActive: boolean;
  autoContentType?: string | null;
  autoLimit?: number | null;
  items: {
    id: string;
    sortOrder: number;
    contentId: string;
    content: { id: string; type: string; title: string; slug: string; status: string };
  }[];
}

export function useShelves(cityId?: string) {
  return useQuery({
    queryKey: ['shelves', cityId ?? 'global'],
    queryFn: () =>
      cmsFetch<ShelfRow[]>(`/homepage/shelves${cityId ? `?cityId=${cityId}` : ''}`),
  });
}

export function useUpsertShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      cmsFetch('/homepage/shelves', { method: 'PUT', json: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shelves'] }),
  });
}

export function useSetShelfSlots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contentIds }: { id: string; contentIds: string[] }) =>
      cmsFetch(`/homepage/shelves/${id}/slots`, { method: 'POST', json: { contentIds } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shelves'] }),
  });
}

export function useDeleteShelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsFetch(`/homepage/shelves/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shelves'] }),
  });
}

// ── Site settings (footer + Contact page: contact email, address, socials) ────

export interface SiteSettingsRow {
  contactEmail: string;
  phone: string | null;
  addressLine: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  updatedAt?: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => cmsFetch<SiteSettingsRow>('/settings/site'),
  });
}

export function useSaveSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SiteSettingsRow>) =>
      cmsFetch<SiteSettingsRow>('/settings/site', { method: 'PATCH', json: data }),
    onSuccess: (r) => qc.setQueryData(['site-settings'], r),
  });
}

// ── Dashboard overview (single aggregate) ────────────────────────────────────

export interface DashboardData {
  content: {
    byType: Record<string, { published: number; draft: number; archived: number }>;
    totals: { published: number; draft: number; archived: number };
    featured: number;
  };
  publishedPerWeek: { weekOf: string; count: number }[];
  views: {
    last7d: number;
    topViewed: { id: string; type: string; title: string; slug: string; views: number }[];
  };
  newsletter: {
    issues: number;
    lastSent: {
      id: string;
      subject: string;
      sentAt: string | null;
      recipientCount: number | null;
      openCount: number | null;
      clickCount: number | null;
    } | null;
    next: string | null;
    cadence: { cron: string; timezone: string; enabled: boolean } | null;
  };
  subscribers: {
    active: number;
    unsubscribed: number;
    newThisWeek: number;
    topStates: { state: string; count: number }[];
  };
  queue: { pendingListings: number; newContacts: number };
  coverage: { statesWithContent: number; statesTotal: number };
  recentActivity: { id: string; action: string; entity: string; at: string; by: string }[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => cmsFetch<DashboardData>('/dashboard'),
    staleTime: 30_000,
  });
}
