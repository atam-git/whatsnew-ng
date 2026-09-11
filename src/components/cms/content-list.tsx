'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Star } from 'lucide-react';
import Image from 'next/image';
import { CONTENT_TYPES } from '@/lib/cms/content-schema';
import { useContentList, useSetContentStatus, useDeleteContent, type ContentRow } from '@/lib/cms/hooks';
import {
  PageHeader,
  Button,
  DataTable,
  SearchInput,
  StatusBadge,
  EmptyState,
  Select,
  useToast,
  useConfirm,
  type Column,
} from './ui';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { ContentStatus } from '@/lib/api/types';

const STATUS_FILTERS = ['', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const;

export function ContentList({ type }: { type: string }) {
  const cfg = CONTENT_TYPES[type];
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useContentList(type, { status: status || undefined });
  const setStatusM = useSetContentStatus(type);
  const del = useDeleteContent(type);

  const rows = useMemo(() => {
    const all = data?.data ?? [];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((r) => r.title.toLowerCase().includes(needle)) : all;
  }, [data, q]);

  const columns: Column<ContentRow>[] = [
    {
      key: 'cover',
      header: '',
      width: 'w-16',
      cell: (r) =>
        r.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.coverImage.url} alt="" className="border-line h-10 w-14 rounded-md border object-cover" />
        ) : (
          <div className="bg-canvas border-line relative h-10 w-14 overflow-hidden rounded-md border">
            <Image
              src="/Whatsnew.ng.png"
              alt=""
              fill
              className="object-contain p-1"
            />
          </div>
        ),
    },
    {
      key: 'title',
      header: 'Title',
      primary: true,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="text-ink font-medium">{r.title}</span>
          {r.featured && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              <Star className="h-3 w-3" fill="currentColor" />
              Featured
            </div>
          )}
        </div>
      ),
    },
    { key: 'status', header: 'Status', width: 'w-28', cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'publishDate',
      header: 'Publish date',
      width: 'w-40',
      cell: (r) =>
        r.publishDate ? (
          <span className="text-muted text-[13px]">
            {r.status === 'SCHEDULED' ? `${formatDateTime(r.publishDate)} WAT` : formatDate(r.publishDate)}
          </span>
        ) : (
          <span className="text-muted text-[13px]">-</span>
        ),
    },
    {
      key: 'states',
      header: 'States',
      width: 'w-40',
      cell: (r) => {
        const states = [...new Set(r.cities.map((c) => c.state).filter(Boolean))];
        return <span className="text-muted text-[13px]">{states.join(', ') || '-'}</span>;
      },
    },
  ];

  const bulkStatus = async (next: ContentStatus) => {
    const ids = [...selected];
    if (!ids.length) return;
    const ok = await confirm({
      title: `Move ${ids.length} item${ids.length > 1 ? 's' : ''} to ${next.toLowerCase()}?`,
      danger: next === 'ARCHIVED',
    });
    if (!ok) return;
    await Promise.all(ids.map((id) => setStatusM.mutateAsync({ id, status: next })));
    toast(`Updated ${ids.length}`, 'success');
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const ok = await confirm({
      title: `Delete ${ids.length} item${ids.length > 1 ? 's' : ''}?`,
      message: 'This cannot be undone.',
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
        title={cfg.label}
        subtitle={data ? `${data.meta?.total ?? data.data.length} total` : undefined}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder={`Search ${cfg.label.toLowerCase()}…`} className="max-w-xs flex-1" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? s[0] + s.slice(1).toLowerCase() : 'All statuses'}
            </option>
          ))}
        </Select>
        <div className="ml-auto">
          <Button onClick={() => router.push(`/cms/content/${type}/new`)}>
            <Plus className="h-4 w-4" /> New {cfg.label.toLowerCase()}
          </Button>
        </div>
        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted text-[13px]">{selected.size} selected</span>
            <Button size="sm" variant="secondary" onClick={() => bulkStatus('SCHEDULED')}>
              Schedule
            </Button>
            <Button size="sm" variant="secondary" onClick={() => bulkStatus('PUBLISHED')}>
              Publish
            </Button>
            <Button size="sm" variant="secondary" onClick={() => bulkStatus('ARCHIVED')}>
              Archive
            </Button>
            <Button size="sm" variant="danger" onClick={bulkDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        onRowClick={(r) => router.push(`/cms/content/${type}/${r.id}`)}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        empty={
          <EmptyState
            title={q || status ? 'No matches' : `No ${cfg.label.toLowerCase()} yet`}
            description={q || status ? 'Try a different search or filter.' : 'Create your first one.'}
            action={
              !q && !status ? (
                <Button onClick={() => router.push(`/cms/content/${type}/new`)}>
                  <Plus className="h-4 w-4" /> New {cfg.label.toLowerCase()}
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  );
}
