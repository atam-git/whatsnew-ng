'use client';

import { useMemo, useState } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import {
  useAdminTags,
  useSaveTag,
  useDeleteTag,
  type AdminTag,
  type TagKind,
} from '@/lib/cms/admin-hooks';
import {
  PageHeader,
  Button,
  DataTable,
  SearchInput,
  Dialog,
  Field,
  Input,
  Textarea,
  Select,
  EmptyState,
  useToast,
  useConfirm,
  type Column,
} from './ui';
import { cn } from '@/lib/utils/cn';

const KINDS: TagKind[] = ['READ_TAG', 'CUISINE', 'AMENITY', 'INDUSTRY', 'DENOMINATION', 'GENERIC'];
const KIND_LABEL: Record<TagKind, string> = {
  READ_TAG: 'Read',
  CUISINE: 'Cuisine',
  AMENITY: 'Amenity',
  INDUSTRY: 'Industry',
  DENOMINATION: 'Denomination',
  GENERIC: 'General',
};

interface Draft {
  id?: string;
  name: string;
  kind: TagKind;
  description: string;
  slug: string;
}
const empty: Draft = { name: '', kind: 'GENERIC', description: '', slug: '' };

export function TagsView() {
  const { data, isLoading } = useAdminTags();
  const save = useSaveTag();
  const del = useDeleteTag();
  const toast = useToast();
  const confirm = useConfirm();

  const [q, setQ] = useState('');
  const [kind, setKind] = useState<TagKind | ''>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Draft | null>(null);

  const tags = useMemo(() => data ?? [], [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of tags) c[t.kind] = (c[t.kind] ?? 0) + 1;
    return c;
  }, [tags]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tags
      .filter((t) => (kind ? t.kind === kind : true))
      .filter((t) => (needle ? t.name.toLowerCase().includes(needle) : true));
  }, [tags, q, kind]);

  const columns: Column<AdminTag>[] = [
    {
      key: 'name',
      header: 'Tag',
      primary: true,
      cell: (t) => <span className="text-ink font-medium">{t.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      cell: (t) => (
        <span className="text-muted text-[13px]">{t.description || '-'}</span>
      ),
    },
    {
      key: 'kind',
      header: 'Kind',
      width: 'w-32',
      cell: (t) => (
        <span className="border-line bg-canvas text-muted-700 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium">
          {KIND_LABEL[t.kind]}
        </span>
      ),
    },
    {
      key: 'slug',
      header: 'Page',
      width: 'w-44',
      cell: (t) => (
        <a
          href={`/tag/${t.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted hover:text-brand-700 inline-flex items-center gap-1 text-[13px]"
        >
          /tag/{t.slug}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: 'contentCount',
      header: 'Items',
      width: 'w-16',
      align: 'right',
      cell: (t) => <span className="text-muted tabular-nums">{t.contentCount}</span>,
    },
  ];

  const submit = async () => {
    if (!draft?.name.trim()) return;
    try {
      await save.mutateAsync({
        id: draft.id,
        name: draft.name.trim(),
        kind: draft.kind,
        description: draft.description.trim() || undefined,
        slug: draft.slug.trim() || undefined,
      });
      toast(draft.id ? 'Tag updated' : 'Tag added', 'success');
      setDraft(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  };

  const removeMany = async (ids: string[]) => {
    const used = tags.filter((t) => ids.includes(t.id) && t.contentCount > 0);
    const ok = await confirm({
      title: `Delete ${ids.length} tag${ids.length > 1 ? 's' : ''}?`,
      message: used.length
        ? `${used.length} of them ${used.length > 1 ? 'are' : 'is'} still on published content - those items keep their other tags.`
        : undefined,
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await Promise.all(ids.map((id) => del.mutateAsync(id)));
    toast(`Deleted ${ids.length}`, 'success');
    setSelected(new Set());
  };

  return (
    <div>
      <PageHeader
        title="Tags"
        subtitle="Topic labels on content, separate from the content type. Each gets a public page at /tag/<slug>."
      />

      <div className="mb-3 flex items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search tags…" className="max-w-xs flex-1" />
        <div className="ml-auto">
          <Button onClick={() => setDraft({ ...empty, kind: kind || 'GENERIC' })}>
            <Plus className="h-4 w-4" /> New tag
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <KindPill active={kind === ''} onClick={() => setKind('')} label="All" count={tags.length} />
        {KINDS.map((k) =>
          counts[k] ? (
            <KindPill
              key={k}
              active={kind === k}
              onClick={() => setKind(k)}
              label={KIND_LABEL[k]}
              count={counts[k]}
            />
          ) : null,
        )}
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <span className="text-muted text-[13px]">{selected.size} selected</span>
          <Button size="sm" variant="danger" onClick={() => removeMany([...selected])}>
            Delete
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        onRowClick={(t) =>
          setDraft({
            id: t.id,
            name: t.name,
            kind: t.kind,
            description: t.description ?? '',
            slug: t.slug,
          })
        }
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        empty={
          <EmptyState
            title={q || kind ? 'No matching tags' : 'No tags yet'}
            description={q || kind ? 'Try a different search or kind.' : 'Add your first label.'}
          />
        }
      />

      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit tag' : 'New tag'}
        footer={
          <div className="flex w-full items-center justify-between">
            {draft?.id ? (
              <Button variant="danger" size="sm" onClick={() => removeMany([draft.id!])}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button size="sm" loading={save.isPending} onClick={submit}>
              Save
            </Button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_180px] gap-3">
              <Field label="Name" required>
                <Input
                  autoFocus
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Nightlife"
                />
              </Field>
              <Field label="Kind">
                <Select
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value as TagKind })}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Description" hint="Shown on the public tag page.">
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={2}
              />
            </Field>
            <Field label="Slug" hint="Auto from the name if left blank.">
              <Input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="nightlife"
              />
            </Field>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function KindPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition',
        active
          ? 'border-brand-600 bg-brand-50 text-brand-700'
          : 'border-line text-muted-700 hover:border-ink',
      )}
    >
      {label}
      <span className="opacity-60 tabular-nums">{count}</span>
    </button>
  );
}
