'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Star } from 'lucide-react';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { CONTENT_TYPES, type FieldKind } from '@/lib/cms/content-schema';
import { APP_TIMEZONE, formatDateTime } from '@/lib/utils/format';
import { isAutoThumbnailPlatform } from '@/lib/utils/card-thumbnail';
import { useUnsavedChangesGuard } from './use-unsaved-changes-guard';
import {
  useContentItem,
  useSaveContent,
  useSetContentStatus,
  useDeleteContent,
  useCities,
  useTags,
  useCreateTag,
  useSlugCheck,
  useFeaturedContent,
} from '@/lib/cms/hooks';
import { PageHeader, Card, Button, Field, Input, Textarea, DateTimePicker, useToast, useConfirm } from './ui';
import { StatusBadge } from './ui/status-badge';
import { RichTextEditor } from './rich-text-editor-lazy';
import { FieldRenderer } from './field-renderer';
import { MediaField, GalleryField } from './media-picker';
import { CsvImport } from './csv-import';
import { EntitySelect } from './entity-select';
import type { ContentStatus } from '@/lib/api/types';

const DETAIL_KEY: Record<string, string> = {
  reads: 'read',
  hotels: 'hotel',
  restaurants: 'restaurant',
  events: 'event',
  songs: 'song',
  videos: 'video',
  startups: 'startup',
  businesses: 'business',
  churches: 'church',
  opportunities: 'opportunity',
};

const TYPE_ARTICLE: Record<string, string> = {
  READ: 'a read',
  HOTEL: 'a hotel',
  RESTAURANT: 'a restaurant',
  EVENT: 'an event',
  SONG: 'a song',
  VIDEO: 'a video',
  STARTUP: 'a startup',
  BUSINESS: 'a business',
  CHURCH: 'a faith event',
  OPPORTUNITY: 'an opportunity',
};
const a = (t?: string) => (t && TYPE_ARTICLE[t]) || 'another item';

// Native <input type="datetime-local"/"date"> always reads/writes device-local wall-clock
// digits with no timezone info, so these must build the string from LOCAL getters (not
// toISOString, which is UTC) - otherwise the round-trip through register()/toPayload
// silently shifts the value by the device's UTC offset on every reload.
const pad = (n: number) => String(n).padStart(2, '0');
const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toDateInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Suggested publish time (now + 1h, rounded up to the hour, in WAT) for when
// none is set yet. Baked into toForm()'s output so it's part of the SAME
// object used as both the form's current value and its dirty-comparison
// baseline - a suggestion the user never picked must never register as a
// change, only an actual edit should.
function defaultPublishDate(): string {
  const now = toZonedTime(new Date(), APP_TIMEZONE);
  const rounded = new Date(now.getTime() + 60 * 60 * 1000);
  if (rounded.getMinutes() !== 0 || rounded.getSeconds() !== 0) {
    rounded.setHours(rounded.getHours() + 1);
  }
  rounded.setMinutes(0, 0, 0);
  return fromZonedTime(rounded, APP_TIMEZONE).toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toForm(type: string, item: any) {
  const cfg = CONTENT_TYPES[type];
  const detail = item?.[DETAIL_KEY[type]] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    excerpt: item?.excerpt ?? '',
    body: item?.body ?? null,
    featured: item?.featured ?? false,
    // DateTimePicker consumes/produces a real absolute ISO instant and does its own
    // WAT conversion internally - pass it through raw, do not wall-clock-format it.
    // Always the true publishDate column - a still-unpublished draft with a
    // stale past value (e.g. left over from earlier testing) is treated as
    // unset, so the calculated default kicks in instead. Once SCHEDULED it's
    // real and never second-guessed. (PUBLISHED/ARCHIVED show publishedAt
    // instead, read-only - see the sidebar JSX - this field is left alone so
    // a generic save can never accidentally overwrite it with that.)
    publishDate:
      !item?.publishDate || (item?.status === 'DRAFT' && new Date(item.publishDate) <= new Date())
        ? defaultPublishDate()
        : item.publishDate,
    seoTitle: item?.seoTitle ?? '',
    seoDescription: item?.seoDescription ?? '',
    source: item?.source ?? '',
    sourceUrl: item?.sourceUrl ?? '',
    externalUrl: item?.externalUrl ?? '',
    coverImageId: item?.coverImage?.id ?? null,
    _cover: item?.coverImage ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _gallery: item?.gallery?.map((g: any) => g.media) ?? [],
    galleryMediaIds: item?.gallery?.map((g: { media: { id: string } }) => g.media.id) ?? [],
    cityIds: item?.cities?.map((c: { id: string }) => c.id) ?? [],
    tagIds: item?.tags?.map((t: { id: string }) => t.id) ?? [],
  };
  for (const f of cfg.groups.flatMap((g) => g.fields)) {
    const v = detail[f.key];
    out[f.key] =
      (f.kind === 'datetime' || f.kind === 'date') && f.blockPast
        ? (v ?? '') // DateTimePicker field - raw ISO instant, converted to WAT internally
        : f.kind === 'datetime'
          ? toLocalInput(v)
          : f.kind === 'date'
            ? toDateInput(v)
            : f.kind === 'stringList'
            ? (v ?? [])
            : f.kind === 'keyValue'
              ? (v ?? {})
              : f.kind === 'boolean'
                ? !!v
                : (v ?? '');
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPayload(type: string, values: Record<string, any>, isEdit: boolean) {
  const cfg = CONTENT_TYPES[type];
  const kinds: Record<string, FieldKind | 'baseDatetime'> = { publishDate: 'baseDatetime' };
  for (const f of cfg.groups.flatMap((g) => g.fields)) kinds[f.key] = f.kind;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: Record<string, any> = {};
  for (const [k, v] of Object.entries(values)) {
    if (k === '_cover' || k === '_gallery') continue;
    if (Array.isArray(v)) {
      p[k] = v;
      continue;
    }
    // On edit, send an explicit null so a removed cover disconnects; on create,
    // only send it when set (Prisma create rejects a disconnect).
    if (k === 'coverImageId') {
      if (v) p[k] = v;
      else if (isEdit) p[k] = null;
      continue;
    }
    const isEmpty = v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
    if (isEmpty) {
      // On create, just omit unset optional fields. On edit, send an explicit
      // null - otherwise a PATCH that drops a key means "leave it alone" to
      // Prisma, so clearing a previously-set field would silently do nothing.
      if (isEdit) p[k] = null;
      continue;
    }
    const kind = kinds[k];
    if ((kind === 'datetime' || kind === 'date' || kind === 'baseDatetime') && v) {
      p[k] = new Date(v).toISOString();
    } else {
      p[k] = v;
    }
  }
  return p;
}

export function ContentForm({ type, id }: { type: string; id: string }) {
  const cfg = CONTENT_TYPES[type];
  const isNew = id === 'new';
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item, isLoading } = useContentItem<any>(type, id);
  const save = useSaveContent(type);
  const setStatus = useSetContentStatus(type);
  const del = useDeleteContent(type);
  const cities = useCities();
  const tags = useTags();
  const createTag = useCreateTag();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty, dirtyFields },
  } = useForm({ defaultValues: toForm(type, null) });

  const [savedId, setSavedId] = useState<string | null>(null);
  const effectiveId = savedId ?? (isNew ? null : id);
  const status: ContentStatus = item?.status ?? 'DRAFT';

  const slugValue = (watch('slug') as string) ?? '';
  const publishDateValue = watch('publishDate') as string | null;

  // "Must be in the future" only means something before something is actually
  // live - once PUBLISHED/ARCHIVED, its publish date is real history and a
  // past date there is correct, not an error.
  const publishDateError = publishDateValue && status !== 'PUBLISHED' && status !== 'ARCHIVED' ? (() => {
    const selectedDate = toZonedTime(new Date(publishDateValue), APP_TIMEZONE);
    const now = toZonedTime(new Date(), APP_TIMEZONE);
    return selectedDate <= now ? 'Publish date must be in the future' : undefined;
  })() : undefined;
  const slug = useSlugCheck(type, slugValue, effectiveId ?? undefined);
  const featuredCheck = useFeaturedContent(effectiveId ?? undefined);
  const isFeatured = watch('featured') as boolean;
  
  // Watch source fields for conditional validation
  const sourceValue = watch('source') as string;
  const sourceUrlValue = watch('sourceUrl') as string;
  const externalUrlValue = watch('externalUrl') as string;
  
  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    if (!url || !url.trim()) return true; // Empty is valid (optional field)
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  // Compute validation errors for source fields (only for READ type)
  const sourceError = type === 'reads' && sourceValue && !sourceUrlValue 
    ? 'Source URL is required when crediting a source'
    : undefined;
  const sourceUrlError = type === 'reads' && sourceUrlValue && !sourceValue
    ? 'Source name is required when providing a URL'
    : !isValidUrl(sourceUrlValue)
    ? 'Enter a valid URL (e.g., https://example.com)'
    : undefined;
  const externalUrlError = externalUrlValue && !isValidUrl(externalUrlValue)
    ? 'Enter a valid URL (e.g., https://example.com)'
    : undefined;

  // ── CSV import (create only) ────────────────────────────────────────────
  // A queue of rows from a multi-row CSV. Each is filled into the form, the
  // user adds images and saves, then we advance to the next unsaved row.
  const [queue, setQueue] = useState<Record<string, unknown>[]>([]);
  const [qi, setQi] = useState(0);
  const [doneIdx, setDoneIdx] = useState<Set<number>>(new Set());

  const applyRow = (values: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(values)) {
      // A blank CSV cell means "leave this field at whatever the fresh form
      // already has" (e.g. the computed default publish date) - not "clear it".
      if (v === '') continue;
      setValue(k as never, v as never, { shouldDirty: true });
    }
  };
  /** Fresh blank form + this row's values + cleared media. */
  const loadRow = (i: number) => {
    reset(toForm(type, null));
    applyRow(queue[i]);
    setQi(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const nextPending = (from: number) => {
    for (let i = from + 1; i < queue.length; i++) if (!doneIdx.has(i)) return i;
    for (let i = 0; i < queue.length; i++) if (!doneIdx.has(i) && i !== qi) return i;
    return -1;
  };
  const prevPending = (from: number) => {
    for (let i = from - 1; i >= 0; i--) if (!doneIdx.has(i)) return i;
    return -1;
  };

  const handleImport = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    setDoneIdx(new Set());
    setQueue(rows);
    reset(toForm(type, null));
    applyRow(rows[0]);
    setQi(0);
  };
  const discardQueue = () => {
    setQueue([]);
    setQi(0);
    setDoneIdx(new Set());
  };
  const inQueue = queue.length > 1;
  const isLastPending = inQueue && nextPending(qi) === -1;

  useEffect(() => {
    if (item) reset(toForm(type, item), { keepDefaultValues: false });
  }, [item, type, reset]);

  // Warn before leaving (tab close/refresh, browser Back, in-app link clicks)
  // while the form has unsaved changes.
  useUnsavedChangesGuard(isDirty);

  const onSubmit = handleSubmit(async (values) => {
    if (!values.cityIds?.length) {
      toast('Pick at least one state under Organise.', 'error');
      return;
    }

    // Validation for READ content type
    if (type === 'reads') {
      if (!values.excerpt) {
        toast('Excerpt is required for articles.', 'error');
        return;
      }
      if (!values.coverImageId) {
        toast('Cover image is required for articles.', 'error');
        return;
      }
      // If source is provided, sourceUrl is required (legal attribution)
      if (values.source && !values.sourceUrl) {
        toast('Source URL is required when crediting a source.', 'error');
        return;
      }
      // If sourceUrl is provided, source name is required
      if (values.sourceUrl && !values.source) {
        toast('Source name is required when providing a source URL.', 'error');
        return;
      }
    }

    // Validation for HOTEL content type
    if (type === 'hotels') {
      if (!values.coverImageId) {
        toast('Cover image is required for hotels.', 'error');
        return;
      }
      if (!values.address) {
        toast('Address is required for hotels.', 'error');
        return;
      }
      if (!values.neighbourhood) {
        toast('Neighbourhood is required for hotels.', 'error');
        return;
      }
      if (!values.phone) {
        toast('Phone number is required for hotels.', 'error');
        return;
      }
      if (!values.priceRange) {
        toast('Price range is required for hotels.', 'error');
        return;
      }
    }

    // Validation for RESTAURANT content type
    if (type === 'restaurants') {
      if (!values.coverImageId) {
        toast('Cover image is required for restaurants.', 'error');
        return;
      }
      if (!values.address) {
        toast('Address is required for restaurants.', 'error');
        return;
      }
      if (!values.neighbourhood) {
        toast('Neighbourhood is required for restaurants.', 'error');
        return;
      }
      if (!values.phone) {
        toast('Phone number is required for restaurants.', 'error');
        return;
      }
      if (!values.priceRange) {
        toast('Price range is required for restaurants.', 'error');
        return;
      }
      if (!values.cuisines || (values.cuisines as string[]).length === 0) {
        toast('At least one cuisine type is required for restaurants.', 'error');
        return;
      }
    }

    // Validation for EVENT content type
    if (type === 'events') {
      if (!values.coverImageId) {
        toast('Cover image is required for events.', 'error');
        return;
      }
      if (!values.startDateTime) {
        toast('Start date and time is required for events.', 'error');
        return;
      }
      if (!values.venueName) {
        toast('Venue name is required for events.', 'error');
        return;
      }
      if (!values.address) {
        toast('Address is required for events.', 'error');
        return;
      }
      if (!values.neighbourhood) {
        toast('Neighbourhood is required for events.', 'error');
        return;
      }
    }

    // Validation for SONG content type
    if (type === 'songs') {
      if (!values.artist) {
        toast('Artist name is required for songs.', 'error');
        return;
      }
      if (!values.genre || (values.genre as string[]).length === 0) {
        toast('At least one genre is required for songs.', 'error');
        return;
      }
      // At least one streaming link required
      const hasStreamingLink =
        values.spotifyUrl || values.appleMusicUrl || values.youtubeMusicUrl || values.audiomackUrl;
      if (!hasStreamingLink) {
        toast('At least one streaming link is required (Spotify, Apple Music, YouTube Music, or Audiomack).', 'error');
        return;
      }
    }

    // Validation for VIDEO content type
    if (type === 'videos') {
      if (!values.videoUrl) {
        toast('Video URL is required for videos.', 'error');
        return;
      }
      // YouTube/Vimeo links get a thumbnail derived automatically - a cover
      // upload is only required when we can't do that for the given link.
      if (!values.coverImageId && !isAutoThumbnailPlatform(values.videoUrl as string)) {
        toast('Cover image is required unless the video link is YouTube or Vimeo.', 'error');
        return;
      }
      if (!values.creatorName) {
        toast('Creator name is required for videos.', 'error');
        return;
      }
      if (!values.topics || (values.topics as string[]).length === 0) {
        toast('At least one topic is required for videos.', 'error');
        return;
      }
    }

    // Validation for STARTUP content type
    if (type === 'startups') {
      if (!values.coverImageId) {
        toast('Cover image is required for startups.', 'error');
        return;
      }
      if (!values.tagline) {
        toast('Tagline is required for startups.', 'error');
        return;
      }
      if (!values.sector || (values.sector as string[]).length === 0) {
        toast('At least one sector is required for startups.', 'error');
        return;
      }
      if (!values.stage) {
        toast('Stage is required for startups.', 'error');
        return;
      }
      if (!values.startupStatus) {
        toast('Status is required for startups.', 'error');
        return;
      }
      if (!values.foundedYear) {
        toast('Founded year is required for startups.', 'error');
        return;
      }
      if (!values.website) {
        toast('Website is required for startups.', 'error');
        return;
      }
    }

    // Validation for BUSINESS content type
    if (type === 'businesses') {
      if (!values.coverImageId) {
        toast('Cover image is required for new businesses.', 'error');
        return;
      }
      if (!values.tagline) {
        toast('Tagline is required for new businesses.', 'error');
        return;
      }
      if (!values.neighbourhood) {
        toast('Neighbourhood is required for new businesses.', 'error');
        return;
      }
      if (!values.phone) {
        toast('Phone is required for new businesses.', 'error');
        return;
      }
    }

    // Validation for CHURCH (faith event) content type
    if (type === 'churches') {
      if (!values.coverImageId) {
        toast('Cover image is required for faith events.', 'error');
        return;
      }
      if (!values.hostOrSpeaker) {
        toast('Host / speaker is required for faith events.', 'error');
        return;
      }
      if (!values.eventDate) {
        toast('Event date is required for faith events.', 'error');
        return;
      }
      if (!values.venueName) {
        toast('Venue is required for faith events.', 'error');
        return;
      }
      if (!values.neighbourhood) {
        toast('Neighbourhood is required for faith events.', 'error');
        return;
      }
      if (!values.address) {
        toast('Address is required for faith events.', 'error');
        return;
      }
    }

    // Validation for OPPORTUNITY content type
    if (type === 'opportunities') {
      if (!values.coverImageId) {
        toast('Cover image is required for opportunities.', 'error');
        return;
      }
      if (!values.opportunityType) {
        toast('Type is required for opportunities.', 'error');
        return;
      }
      if (!values.organiser) {
        toast('Organiser is required for opportunities.', 'error');
        return;
      }
      if (!values.deadline) {
        toast('Deadline is required for opportunities.', 'error');
        return;
      }
      if (!values.applyUrl) {
        toast('Apply URL is required for opportunities.', 'error');
        return;
      }
    }

    // auto-slug from title if blank
    if (!values.slug && values.title) {
      values.slug = values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    try {
      const res = (await save.mutateAsync({
        id: effectiveId ?? undefined,
        data: toPayload(type, values, !!effectiveId),
      })) as { id: string };

      // Multi-row CSV: mark this row saved, move to the next unsaved one.
      if (inQueue && res?.id && !effectiveId) {
        const done = new Set(doneIdx).add(qi);
        setDoneIdx(done);
        const next = (() => {
          for (let i = qi + 1; i < queue.length; i++) if (!done.has(i)) return i;
          for (let i = 0; i < queue.length; i++) if (!done.has(i)) return i;
          return -1;
        })();
        if (next === -1) {
          toast(`All ${queue.length} ${cfg.label.toLowerCase()}s created.`, 'success');
          discardQueue();
          router.push(`/cms/content/${type}`);
        } else {
          toast(`Saved ${done.size} of ${queue.length}. Next up: item ${next + 1}.`, 'success');
          loadRow(next);
        }
        return;
      }

      toast(isNew && !savedId ? `${cfg.label} created` : 'Saved', 'success');
      if (res?.id && !effectiveId) {
        setSavedId(res.id);
        // Redirect to content list after creating new item
        router.push(`/cms/content/${type}`);
      } else {
        // Redirect to content list after updating existing item
        router.push(`/cms/content/${type}`);
      }
      reset(values);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  });

  const changeStatus = async (next: ContentStatus, confirmMsg?: string) => {
    if (!effectiveId) {
      toast('Save the draft first', 'info');
      return;
    }
    
    // Prevent scheduling with past dates/times
    if (next === 'SCHEDULED') {
      const publishDate = watch('publishDate') as string | null;
      if (!publishDate) {
        toast('Set a publish date before scheduling', 'error');
        return;
      }
      const publishDateTime = toZonedTime(new Date(publishDate), APP_TIMEZONE);
      const now = toZonedTime(new Date(), APP_TIMEZONE);
      if (publishDateTime <= now) {
        toast('Cannot schedule content for the past. Choose a future date and time', 'error');
        return;
      }
      // The publish date only lives in form state until the form is saved - the
      // status-change request below doesn't send it, so the backend would otherwise
      // check its OLD stored publishDate (often null/stale) and reject the schedule
      // even though the date on screen is valid. Persist it first.
      try {
        await save.mutateAsync({ id: effectiveId, data: { publishDate: new Date(publishDate).toISOString() } });
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Failed to save publish date', 'error');
        return;
      }
    }

    if (confirmMsg) {
      const ok = await confirm({ title: confirmMsg, danger: next === 'ARCHIVED' });
      if (!ok) return;
    }
    try {
      await setStatus.mutateAsync({ id: effectiveId, status: next });
      toast(next === status && next === 'SCHEDULED' ? 'Rescheduled' : `Moved to ${next.toLowerCase()}`, 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const remove = async () => {
    if (!effectiveId) return;
    const ok = await confirm({
      title: `Delete this ${cfg.label.toLowerCase()}?`,
      message: 'This cannot be undone.',
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await del.mutateAsync(effectiveId);
    toast('Deleted', 'success');
    router.push(`/cms/content/${type}`);
  };

  const cityOpts = useMemo(
    () => (cities.data ?? []).map((c) => ({ id: c.id, name: c.name })),
    [cities.data],
  );
  const tagOpts = useMemo(() => (tags.data ?? []).map((t) => ({ id: t.id, name: t.name })), [tags.data]);

  if (!isNew && isLoading) {
    return <div className="border-line bg-surface h-96 animate-pulse rounded-2xl border" />;
  }

  return (
    <form onSubmit={onSubmit}>
      <PageHeader
        backHref={`/cms/content/${type}`}
        title={isNew && !savedId ? `New ${cfg.label.toLowerCase()}` : (watch('title') || 'Untitled')}
        subtitle={effectiveId ? undefined : 'Not saved yet'}
        actions={
          <>
            {effectiveId && (
              <Button type="button" variant="ghost" size="sm" onClick={remove}>
                Delete
              </Button>
            )}
            <Button type="submit" loading={save.isPending}>
              {effectiveId
                ? 'Save'
                : inQueue
                  ? isLastPending
                    ? 'Save & finish'
                    : 'Save & next'
                  : `Create ${cfg.label.toLowerCase()}`}
            </Button>
          </>
        }
      />

      {!effectiveId && (
        <div className="mb-6">
          {inQueue ? (
            <div className="border-brand-200 bg-brand-50 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <p className="text-[13px]">
                <span className="text-brand-800 font-semibold">CSV import</span>
                <span className="text-brand-700">
                  {' '}
                  — item {qi + 1} of {queue.length} · {doneIdx.size} saved
                </span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={prevPending(qi) === -1}
                  onClick={() => loadRow(prevPending(qi))}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={nextPending(qi) === -1}
                  onClick={() => loadRow(nextPending(qi))}
                >
                  Skip
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={discardQueue}>
                  Discard import
                </Button>
              </div>
            </div>
          ) : (
            <CsvImport type={type} label={cfg.label} onImport={handleImport} />
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* main column */}
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <div className="space-y-4">
              <Field label="Title" required htmlFor="title" tooltip="The main headline that appears everywhere">
                <Input id="title" {...register('title', { required: true })} placeholder="Headline" />
              </Field>
              <Field
                label="Slug"
                tooltip="URL-friendly version of the title. Auto-generated if left blank."
                hint={
                  slugValue.trim()
                    ? undefined
                    : 'Auto-generated from the title if left blank.'
                }
              >
                <Input {...register('slug')} placeholder="my-article" spellCheck={false} />
                {slugValue.trim() && (
                  <p className="mt-1 text-[12px]">
                    {slug.pending || slug.checking ? (
                      <span className="text-muted">Checking availability…</span>
                    ) : slug.data?.available ? (
                      <span className="text-emerald-600 font-medium">
                        “{slug.data.slug}” is available
                      </span>
                    ) : slug.data ? (
                      <span className="text-red-600">
                        ✗ Taken by {a(slug.data.takenBy?.type)}
                        {slug.data.takenBy?.title ? ` (“${slug.data.takenBy.title}”)` : ''}. Saving now
                        would use “{slug.data.suggestion}”.{' '}
                        <button
                          type="button"
                          onClick={() =>
                            setValue('slug', slug.data!.suggestion, { shouldDirty: true })
                          }
                          className="text-brand-700 font-semibold underline"
                        >
                          Use it
                        </button>
                      </span>
                    ) : null}
                  </p>
                )}
              </Field>
              <Field label="Excerpt" required tooltip="One-sentence summary shown on cards and below headlines">
                <Textarea {...register('excerpt')} rows={2} placeholder="Brief description" />
              </Field>
              <Field label="Body" tooltip="The full article content with rich text formatting">
                <Controller
                  control={control}
                  name="body"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
            </div>
          </Card>

          {cfg.groups.map((group) => (
            <Card key={group.title} title={group.title}>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.fields.map((f) => (
                  <FieldRenderer key={f.key} def={f} control={control} register={register} watch={watch} />
                ))}
              </div>
            </Card>
          ))}

          <Card title="Media">
            <div className="space-y-5">
              <div>
                <p className="text-muted mb-3 text-xs">
                  <strong className="text-ink">Cover:</strong> Main image shown on cards and at the top of detail pages
                  {type === 'songs' && (
                    <span className="text-muted-600 block mt-1">
                      For music: album art from streaming links (Spotify, Apple Music, Audiomack, YouTube Music) will be used automatically. Upload an image here to override it.
                    </span>
                  )}
                  {(type === 'reads' || type === 'hotels' || type === 'restaurants' || type === 'events' || 
                    type === 'videos' || type === 'startups' || type === 'businesses' || type === 'churches' || 
                    type === 'opportunities') && (
                    <span className="text-red-600 font-semibold"> (Required)</span>
                  )}
                </p>
                <Controller
                  control={control}
                  name="_cover"
                  render={({ field }) => (
                    <MediaField
                      value={field.value}
                      onChange={(m) => {
                        field.onChange(m);
                        setValue('coverImageId', m?.id ?? null, { shouldDirty: true });
                      }}
                    />
                  )}
                />
              </div>
              <div>
                <p className="text-muted mb-3 text-xs">
                  <strong className="text-ink">Gallery:</strong> Additional images shown in a carousel on detail pages
                </p>
                <Controller
                  control={control}
                  name="_gallery"
                  render={({ field }) => (
                    <GalleryField
                      value={field.value ?? []}
                      onChange={(list) => {
                        field.onChange(list);
                        setValue(
                          'galleryMediaIds',
                          list.map((m) => m.id),
                          { shouldDirty: true },
                        );
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card title="Publish">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted text-[13px]">Status</span>
                <StatusBadge status={status} />
              </div>
              {status === 'PUBLISHED' || status === 'ARCHIVED' ? (
                <Field label="Publish date" tooltip="When this actually went live. Unpublish to change it.">
                  <div className="border-line bg-canvas text-ink flex h-9 w-full items-center rounded-md border px-3 text-[13px]">
                    {formatDateTime(item?.publishedAt ?? item?.publishDate) || '—'}
                  </div>
                </Field>
              ) : (
                <Field label="Publish date" tooltip="When this goes live. Leave empty to publish immediately" error={publishDateError}>
                  <Controller
                    control={control}
                    name="publishDate"
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value as string | null}
                        onChange={field.onChange}
                        invalid={!!publishDateError}
                      />
                    )}
                  />
                </Field>
              )}
              <div className="flex flex-col gap-2 pt-1">
                {status !== 'PUBLISHED' && status !== 'SCHEDULED' && (
                  <Button type="button" size="sm" onClick={() => changeStatus('PUBLISHED')} loading={setStatus.isPending}>
                    Publish now
                  </Button>
                )}
                {status !== 'PUBLISHED' && status !== 'SCHEDULED' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => changeStatus('SCHEDULED')}
                    loading={setStatus.isPending}
                    disabled={!!publishDateError || !publishDateValue}
                  >
                    Schedule
                  </Button>
                )}
                {status === 'SCHEDULED' && dirtyFields.publishDate && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => changeStatus('SCHEDULED')}
                    loading={setStatus.isPending}
                    disabled={!!publishDateError || !publishDateValue}
                  >
                    Reschedule
                  </Button>
                )}
                {status === 'SCHEDULED' && (
                  <Button type="button" size="sm" variant="secondary" onClick={() => changeStatus('DRAFT')}>
                    Cancel schedule
                  </Button>
                )}
                {status === 'PUBLISHED' && (
                  <Button type="button" size="sm" variant="secondary" onClick={() => changeStatus('DRAFT', 'Unpublish this item?')}>
                    Unpublish
                  </Button>
                )}
                {status !== 'ARCHIVED' && (
                  <Button type="button" size="sm" variant="secondary" onClick={() => changeStatus('ARCHIVED', 'Archive this item?')}>
                    Archive
                  </Button>
                )}
                {status === 'ARCHIVED' && (
                  <Button type="button" size="sm" variant="secondary" onClick={() => changeStatus('DRAFT')}>
                    Restore to draft
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card title="Organise">
            <div className="space-y-4">
              <Field
                label="State"
                required
                tooltip="Pick one or more states. Use 'Nationwide' for online/countrywide items"
              >
                <Controller
                  control={control}
                  name="cityIds"
                  render={({ field }) => (
                    <EntitySelect
                      options={cityOpts}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add a state…"
                    />
                  )}
                />
              </Field>
              <Field label="Tags" tooltip="Topic labels like 'Must read', 'Fintech', etc. Create new ones as you type">
                <Controller
                  control={control}
                  name="tagIds"
                  render={({ field }) => (
                    <EntitySelect
                      options={tagOpts}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add a tag…"
                      creating={createTag.isPending}
                      onCreate={async (name) => {
                        const t = await createTag.mutateAsync(name);
                        return { id: t.id, name: t.name };
                      }}
                    />
                  )}
                />
              </Field>
              
              {/* Featured toggle */}
              <div className="space-y-2 rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    disabled={!isFeatured && !!featuredCheck.data}
                    className="h-4 w-4 accent-amber-600"
                  />
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-600" fill="currentColor" />
                    <span className="font-semibold text-amber-900">Featured article</span>
                  </div>
                </label>
                {!isFeatured && featuredCheck.data && (
                  <p className="text-xs text-amber-700">
                    Another article is already featured:{' '}
                    <span className="font-medium">{featuredCheck.data.title}</span>
                  </p>
                )}
                {isFeatured && (
                  <p className="text-xs text-amber-700">
                    This article will appear as the hero on the homepage
                  </p>
                )}
              </div>

              <Field 
                label="Source / attribution" 
                tooltip="Credit another publication if you're republishing their content. If filled, Source URL becomes required for legal attribution"
                error={sourceError}
              >
                <Input {...register('source')} placeholder="Connect Nigeria" invalid={!!sourceError} />
              </Field>
              <Field 
                label="Source URL" 
                tooltip="Link to the source's website. Required if Source is filled to provide proper legal attribution"
                error={sourceUrlError}
              >
                <Input {...register('sourceUrl')} placeholder="https://…" invalid={!!sourceUrlError} />
              </Field>
              <Field 
                label="External URL" 
                tooltip="The item's official link: event tickets, restaurant website, or original article URL"
                error={externalUrlError}
              >
                <Input {...register('externalUrl')} placeholder="https://…" invalid={!!externalUrlError} />
              </Field>
            </div>
          </Card>

          <Card title="SEO">
            <div className="space-y-4">
              <Field label="SEO title" tooltip="Custom title for search engines. Defaults to article title if empty">
                <Input {...register('seoTitle')} placeholder="Leave empty to use article title" />
              </Field>
              <Field label="SEO description" tooltip="Summary for Google search results. Defaults to excerpt if empty">
                <Textarea {...register('seoDescription')} rows={2} placeholder="Leave empty to use excerpt" />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
