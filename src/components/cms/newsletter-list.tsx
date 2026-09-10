'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useIssues, useCreateIssue, type IssueRow } from '@/lib/cms/admin-hooks';
import { PageHeader, Button, DataTable, StatusBadge, EmptyState, Dialog, Field, Input, useToast, type Column } from './ui';
import { formatDate } from '@/lib/utils/format';
import { NewsletterSchedule } from './newsletter-schedule';

export function NewsletterList() {
  const router = useRouter();
  const toast = useToast();
  const { data, isLoading } = useIssues();
  const create = useCreateIssue();
  const [subject, setSubject] = useState<string | null>(null);

  const columns: Column<IssueRow>[] = [
    { key: 'subject', header: 'Subject', primary: true, cell: (r) => r.subject },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { key: 'items', header: 'Items', width: 'w-16', cell: (r) => <span className="tabular-nums">{r._count?.items ?? 0}</span> },
    {
      key: 'engagement',
      header: 'Sent · Opens · Clicks',
      cell: (r) =>
        r.status === 'SENT' ? (
          <span className="text-muted text-[12px] tabular-nums">
            {r.recipientCount ?? 0} · {r.openCount ?? 0} · {r.clickCount ?? 0}
          </span>
        ) : (
          <span className="text-muted text-[12px]">-</span>
        ),
    },
    {
      key: 'when',
      header: 'Sent / scheduled',
      cell: (r) => (
        <span className="text-muted text-[12px]">
          {r.sentAt ? formatDate(r.sentAt) : r.scheduledFor ? formatDate(r.scheduledFor) : '-'}
        </span>
      ),
    },
    { key: 'created', header: 'Created', cell: (r) => <span className="text-muted text-[12px]">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Newsletter"
        subtitle="One issue every Wednesday. Autofill pulls the week's published items."
      />

      <NewsletterSchedule />

      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1" />
        <Button onClick={() => setSubject('')}>
          <Plus className="h-4 w-4" /> New issue
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        rows={data ?? []}
        loading={isLoading}
        onRowClick={(r) => router.push(`/cms/newsletter/${r.id}`)}
        empty={<EmptyState title="No issues yet" description="Create one, then autofill it." />}
      />

      <Dialog
        open={subject !== null}
        onClose={() => setSubject(null)}
        title="New issue"
        size="sm"
        footer={
          <div className="flex w-full justify-end">
            <Button
              size="sm"
              loading={create.isPending}
              onClick={async () => {
                if (!subject?.trim()) return;
                const res = await create.mutateAsync({ subject });
                toast('Issue created', 'success');
                setSubject(null);
                router.push(`/cms/newsletter/${res.id}`);
              }}
            >
              Create
            </Button>
          </div>
        }
      >
        <Field label="Subject line" required>
          <Input
            autoFocus
            value={subject ?? ''}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's new - Wed 10 Sep"
          />
        </Field>
      </Dialog>
    </div>
  );
}
