'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  useListingSubmissions,
  usePromoteListing,
  useRejectListing,
  useContacts,
  useSetContactStatus,
  type ListingRow,
} from '@/lib/cms/admin-hooks';
import { CONTENT_PATHS } from '@/lib/api/content';
import { PageHeader, Button, DataTable, StatusBadge, EmptyState, Spinner, useToast, useConfirm, type Column } from './ui';
import { formatDate } from '@/lib/utils/format';

const TABS = [
  ['listings', 'Listing submissions'],
  ['contact', 'Contact inbox'],
] as const;

export function SubmissionsView() {
  const [tab, setTab] = useState<'listings' | 'contact'>('listings');
  return (
    <div>
      <PageHeader title="Submissions" subtitle="Public intake — nothing here is live until you promote it." />
      <div className="border-line mb-5 flex gap-1 border-b">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              'relative px-3 py-2 text-[13px] font-medium transition ' +
              (tab === key ? 'text-brand-700' : 'text-muted hover:text-ink')
            }
          >
            {label}
            {tab === key && <span className="bg-brand-600 absolute inset-x-2 -bottom-px h-0.5 rounded-full" />}
          </button>
        ))}
      </div>
      {tab === 'listings' ? <Listings /> : <Contacts />}
    </div>
  );
}

function Listings() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useListingSubmissions(showAll ? undefined : 'PENDING');
  const promote = usePromoteListing();
  const reject = useRejectListing();

  const columns: Column<ListingRow>[] = [
    {
      key: 'type',
      header: 'Type',
      primary: true,
      cell: (r) => <span className="capitalize">{r.contentType.toLowerCase()}</span>,
    },
    {
      key: 'title',
      header: 'Proposed title',
      cell: (r) => <span className="text-muted-700 text-[13px]">{(r.payload?.title as string) || '—'}</span>,
    },
    {
      key: 'from',
      header: 'From',
      cell: (r) => (
        <span className="text-[13px]">
          {r.submitterName}
          <span className="text-muted block text-[11px]">{r.submitterEmail}</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { key: 'received', header: 'Received', cell: (r) => <span className="text-muted text-[12px]">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (r) =>
        r.status === 'PENDING' ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              loading={promote.isPending}
              onClick={async () => {
                const res = (await promote.mutateAsync(r.id)) as { contentId: string; type: string };
                toast('Promoted to a draft', 'success');
                const path = CONTENT_PATHS[res.type as keyof typeof CONTENT_PATHS] ?? 'reads';
                router.push(`/cms/content/${path}/${res.contentId}`);
              }}
            >
              Promote
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                const ok = await confirm({ title: 'Reject this submission?', danger: true });
                if (!ok) return;
                await reject.mutateAsync(r.id);
                toast('Rejected', 'success');
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-muted text-[12px]">{r.promotedContentId ? 'promoted' : 'reviewed'}</span>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <label className="text-muted flex items-center gap-1.5 text-[12px]">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show reviewed
        </label>
      </div>
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={isLoading}
        empty={<EmptyState title="Nothing pending" description="New listing submissions from the public site land here." />}
      />
    </div>
  );
}

function Contacts() {
  const toast = useToast();
  const { data, isLoading } = useContacts();
  const setStatus = useSetContactStatus();
  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-muted" />
      </div>
    );
  }
  if (!data?.data.length) {
    return <EmptyState title="Inbox empty" description="Messages from the Contact form appear here." />;
  }

  return (
    <ul className="space-y-2">
      {data.data.map((r) => {
        const open = openId === r.id;
        return (
          <li key={r.id} className="border-line bg-surface overflow-hidden rounded-xl border">
            <button
              onClick={() => setOpenId(open ? null : r.id)}
              className="hover:bg-canvas flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <ChevronDown className={'text-muted h-4 w-4 shrink-0 transition ' + (open ? 'rotate-180' : '')} />
              <span className="min-w-0 flex-1">
                <span className="text-ink text-[13px] font-medium">{r.subject || '(no subject)'}</span>
                <span className="text-muted block text-[11px]">
                  {r.name} · {r.email} · {formatDate(r.createdAt)}
                </span>
              </span>
              <StatusBadge status={r.status} />
            </button>
            {open && (
              <div className="border-line border-t px-4 py-3">
                <p className="text-ink whitespace-pre-wrap text-[13px]">{r.message}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setStatus.mutate({ id: r.id, status: 'READ' })}>
                    Mark read
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setStatus.mutate({ id: r.id, status: 'SPAM' });
                      toast('Marked as spam', 'success');
                    }}
                  >
                    Spam
                  </Button>
                  <a
                    href={`mailto:${r.email}?subject=Re: ${encodeURIComponent(r.subject || 'Your message')}`}
                    className="border-line text-muted-700 hover:text-ink ml-auto rounded-lg border px-3 py-1.5 text-[12px]"
                  >
                    Reply by email
                  </a>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
