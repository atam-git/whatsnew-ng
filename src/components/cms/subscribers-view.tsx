'use client';

import { useMemo, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import {
  useSubscribers,
  useAddSubscriber,
  useSetSubscriberStatus,
  useDeleteSubscriber,
  subscribersExportUrl,
  type SubscriberRow,
} from '@/lib/cms/admin-hooks';
import {
  PageHeader,
  Button,
  DataTable,
  SearchInput,
  StatusBadge,
  Dialog,
  Field,
  Input,
  EmptyState,
  useToast,
  useConfirm,
  type Column,
} from './ui';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const FILTERS = [
  ['', 'All'],
  ['ACTIVE', 'Active'],
  ['UNSUBSCRIBED', 'Unsubscribed'],
] as const;

export function SubscribersView() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [adding, setAdding] = useState<{ email: string } | null>(null);

  const { data, isLoading } = useSubscribers({ status: status || undefined, q: q || undefined });
  const add = useAddSubscriber();
  const setStatusM = useSetSubscriberStatus();
  const del = useDeleteSubscriber();
  const toast = useToast();
  const confirm = useConfirm();

  const rows = useMemo(() => data?.data ?? [], [data]);

  const columns: Column<SubscriberRow>[] = [
    { key: 'email', header: 'Email', primary: true, cell: (r) => <span className="text-ink font-medium">{r.email}</span> },
    { key: 'status', header: 'Status', width: 'w-32', cell: (r) => <StatusBadge status={r.status} /> },
    { key: 'source', header: 'Source', width: 'w-36', cell: (r) => <span className="text-muted text-[13px]">{r.source ?? '-'}</span> },
    { key: 'subscribedAt', header: 'Subscribed', width: 'w-32', cell: (r) => <span className="text-muted text-[12px]">{formatDate(r.subscribedAt)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (r) => (
        <div className="flex justify-end gap-2">
          {r.status === 'ACTIVE' ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatusM.mutate({ id: r.id, status: 'UNSUBSCRIBED' })}
            >
              Unsubscribe
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatusM.mutate({ id: r.id, status: 'ACTIVE' })}
            >
              Reactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              const ok = await confirm({
                title: `Delete ${r.email}?`,
                message: 'This removes them entirely. Unsubscribe instead if you just want to stop emailing them.',
                danger: true,
                confirmLabel: 'Delete',
              });
              if (!ok) return;
              try {
                await del.mutateAsync(r.id);
                toast('Deleted', 'success');
              } catch (e) {
                toast(e instanceof Error ? e.message : 'Delete failed', 'error');
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const submitAdd = async () => {
    if (!adding?.email.trim()) return;
    try {
      await add.mutateAsync({
        email: adding.email.trim(),
        source: 'cms',
      });
      toast('Subscriber added', 'success');
      setAdding(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not add', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={
          data ? `${data.meta.total} ${status ? status.toLowerCase() : 'total'}` : undefined
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search by email…" className="flex-1 max-w-xs" />
        
        <div className="flex items-center gap-2">
          <a
            href={subscribersExportUrl}
            className="border-line text-muted-700 hover:text-ink inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
          <Button onClick={() => setAdding({ email: '' })}>
            <Plus className="h-4 w-4" /> Add subscriber
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={cn(
              'rounded-full border px-3 py-1 text-[13px] transition',
              status === value
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-line text-muted-700 hover:border-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        empty={
          <EmptyState
            title={q || status ? 'No matching subscribers' : 'No subscribers yet'}
            description={
              q || status
                ? 'Try a different search or filter.'
                : 'They arrive from the Subscribe form and the footer sign-up.'
            }
          />
        }
      />

      <Dialog
        open={!!adding}
        onClose={() => setAdding(null)}
        title="Add subscriber"
        size="sm"
        footer={
          <div className="flex w-full justify-end">
            <Button size="sm" loading={add.isPending} onClick={submitAdd}>
              Add
            </Button>
          </div>
        }
      >
        {adding && (
          <div className="space-y-4">
            <Field label="Email" required>
              <Input
                type="email"
                autoFocus
                value={adding.email}
                onChange={(e) => setAdding({ ...adding, email: e.target.value })}
                placeholder="reader@example.com"
              />
            </Field>
          </div>
        )}
      </Dialog>
    </div>
  );
}
