'use client';

import Link from 'next/link';
import { FileEdit, Inbox, Mail, Users2 } from 'lucide-react';
import { CONTENT_TYPES } from '@/lib/cms/content-schema';
import {
  useContentCounts,
  useListingSubmissions,
  useIssues,
  useSubscriberCount,
} from '@/lib/cms/admin-hooks';
import { PageHeader, Card } from './ui';
import { StatusBadge } from './ui/status-badge';
import { formatDate } from '@/lib/utils/format';

function Stat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border-line bg-surface hover:border-brand-600/40 flex items-center gap-3 rounded-2xl border p-4 transition"
    >
      <span className="bg-brand-50 text-brand-700 flex h-10 w-10 items-center justify-center rounded-xl">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="text-ink block text-[20px] font-bold leading-none">{value}</span>
        <span className="text-muted text-[12px]">{label}</span>
      </span>
    </Link>
  );
}

export function Dashboard() {
  const counts = useContentCounts();
  const pending = useListingSubmissions('PENDING');
  const issues = useIssues();
  const subs = useSubscriberCount();

  const latestIssue = issues.data?.[0];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Everything new in Nigeria, this week." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileEdit} label="Published items" value={counts.isLoading ? '—' : counts.total} href="/cms/content/reads" />
        <Stat
          icon={Inbox}
          label="Submissions pending"
          value={pending.data?.meta.total ?? '—'}
          href="/cms/submissions"
        />
        <Stat
          icon={Mail}
          label="Newsletter issues"
          value={issues.data?.length ?? '—'}
          href="/cms/newsletter"
        />
        <Stat icon={Users2} label="Subscribers" value={subs.data ?? '—'} href="/cms/newsletter" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Content by type">
          <ul className="divide-line -my-1 divide-y">
            {Object.entries(CONTENT_TYPES).map(([key, cfg]) => (
              <li key={key}>
                <Link
                  href={`/cms/content/${key}`}
                  className="hover:text-brand-700 flex items-center justify-between py-2 text-[13px]"
                >
                  <span>{cfg.label}</span>
                  <span className="text-muted tabular-nums">{counts.byType[key] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card title="This week's issue">
            {latestIssue ? (
              <Link href={`/cms/newsletter/${latestIssue.id}`} className="block">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink text-[14px] font-semibold">{latestIssue.subject}</span>
                  <StatusBadge status={latestIssue.status} />
                </div>
                <p className="text-muted mt-1 text-[12px]">
                  {latestIssue._count?.items ?? 0} items ·{' '}
                  {latestIssue.sentAt
                    ? `sent ${formatDate(latestIssue.sentAt)}`
                    : latestIssue.scheduledFor
                      ? `scheduled ${formatDate(latestIssue.scheduledFor)}`
                      : 'draft'}
                </p>
              </Link>
            ) : (
              <p className="text-muted text-[13px]">
                No issues yet.{' '}
                <Link href="/cms/newsletter" className="text-brand-700 font-medium">
                  Build one →
                </Link>
              </p>
            )}
          </Card>

          <Card title="Pending submissions">
            {(pending.data?.data.length ?? 0) === 0 ? (
              <p className="text-muted text-[13px]">Nothing waiting for review.</p>
            ) : (
              <ul className="divide-line -my-1 divide-y">
                {pending.data!.data.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-[13px]">
                    <span className="capitalize">{s.contentType.toLowerCase()}</span>
                    <span className="text-muted text-[12px]">{s.submitterName}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/cms/submissions" className="text-brand-700 mt-3 inline-block text-[13px] font-medium">
              Review all →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
