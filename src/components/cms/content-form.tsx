'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { CONTENT_TYPES, type FieldKind } from '@/lib/cms/content-schema';
import {
  useContentItem,
  useSaveContent,
  useSetContentStatus,
  useDeleteContent,
  useCities,
  useTags,
  useCreateTag,
} from '@/lib/cms/hooks';
import { PageHeader, Card, Button, Field, Input, Textarea, useToast, useConfirm } from './ui';
import { StatusBadge } from './ui/status-badge';
import { RichTextEditor } from './rich-text-editor-lazy';
import { FieldRenderer } from './field-renderer';
import { MediaField, GalleryField } from './media-picker';
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

const toLocalInput = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');
const toDateInput = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

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
    publishDate: toLocalInput(item?.publishDate),
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
      f.kind === 'datetime'
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
    if (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)))
      continue;
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
    formState: { isDirty },
  } = useForm({ defaultValues: toForm(type, null) });

  const [savedId, setSavedId] = useState<string | null>(null);
  const effectiveId = savedId ?? (isNew ? null : id);
  const status: ContentStatus = item?.status ?? 'DRAFT';

  useEffect(() => {
    if (item) reset(toForm(type, item));
  }, [item, type, reset]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  const onSubmit = handleSubmit(async (values) => {
    if (!values.cityIds?.length) {
      toast('Pick at least one city under Organise.', 'error');
      return;
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
      toast(isNew && !savedId ? `${cfg.label} created` : 'Saved', 'success');
      if (res?.id && !effectiveId) {
        setSavedId(res.id);
        router.replace(`/cms/content/${type}/${res.id}`);
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
    if (confirmMsg) {
      const ok = await confirm({ title: confirmMsg, danger: next === 'ARCHIVED' });
      if (!ok) return;
    }
    try {
      await setStatus.mutateAsync({ id: effectiveId, status: next });
      toast(`Moved to ${next.toLowerCase()}`, 'success');
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
              {effectiveId ? 'Save' : `Create ${cfg.label.toLowerCase()}`}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* main column */}
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <div className="space-y-4">
              <Field label="Title" required htmlFor="title">
                <Input id="title" {...register('title', { required: true })} placeholder="Headline" />
              </Field>
              <Field label="Slug" hint="Auto-generated from the title if left blank.">
                <Input {...register('slug')} placeholder="my-article" />
              </Field>
              <Field label="Excerpt" hint="One line shown as the dek and on cards.">
                <Textarea {...register('excerpt')} rows={2} />
              </Field>
              <Field label="Body">
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
                  <FieldRenderer key={f.key} def={f} control={control} register={register} />
                ))}
              </div>
            </Card>
          ))}

          <Card title="Media">
            <div className="space-y-5">
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
              <Field label="Publish date">
                <Input type="datetime-local" {...register('publishDate')} />
              </Field>
              <div className="flex flex-col gap-2 pt-1">
                {status !== 'PUBLISHED' && (
                  <Button type="button" size="sm" onClick={() => changeStatus('PUBLISHED')} loading={setStatus.isPending}>
                    Publish now
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted text-[13px]">Status</span>
                <StatusBadge status={status} />
              </div>
              <Field label="Publish date">
                <Input type="datetime-local" {...register('publishDate')} />
              </Field>
              <div className="flex flex-col gap-2 pt-1">
                {status !== 'PUBLISHED' && (
                  <Button type="button" size="sm" onClick={() => changeStatus('PUBLISHED')} loading={setStatus.isPending}>
                    Publish now
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
              <Field label="Cities" required hint="At least one - this sets the state shown in the site filter.">
                <Controller
                  control={control}
                  name="cityIds"
                  render={({ field }) => (
                    <EntitySelect
                      options={cityOpts}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add a city…"
                    />
                  )}
                />
              </Field>
              <Field label="Tags">
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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('featured')} /> Featured
              </label>
              <Field label="Source / attribution">
                <Input {...register('source')} placeholder="Connect Nigeria" />
              </Field>
              <Field label="Source URL">
                <Input {...register('sourceUrl')} placeholder="https://…" />
              </Field>
              <Field label="External URL" hint="The item's own outbound link.">
                <Input {...register('externalUrl')} placeholder="https://…" />
              </Field>
            </div>
          </Card>

          <Card title="SEO">
            <div className="space-y-4">
              <Field label="SEO title">
                <Input {...register('seoTitle')} />
              </Field>
              <Field label="SEO description">
                <Textarea {...register('seoDescription')} rows={2} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
