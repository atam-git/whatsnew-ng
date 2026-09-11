'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useContacts, useSetContactStatus } from '@/lib/cms/admin-hooks';
import { PageHeader, Button, StatusBadge, EmptyState, Spinner, useToast } from './ui';
import { formatDate } from '@/lib/utils/format';

export function SubmissionsView() {
  const toast = useToast();
  const { data, isLoading } = useContacts();
  const setStatus = useSetContactStatus();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Submissions" subtitle="Messages from the Contact form." />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-muted" />
        </div>
      ) : !data?.data.length ? (
        <EmptyState title="Inbox empty" description="Messages from the Contact form appear here." />
      ) : (
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
      )}
    </div>
  );
}
