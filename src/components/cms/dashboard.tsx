'use client';

import Link from 'next/link';
import {
  FileEdit,
  FileText,
  Eye,
  Users2,
  MailCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { CONTENT_TYPES } from '@/lib/cms/content-schema';
import { CONTENT_PATHS } from '@/lib/api/content';
import { useDashboard, type DashboardData } from '@/lib/cms/admin-hooks';
import { PageHeader, Card } from './ui';
import { Skeleton } from './ui/misc';
import { formatDate, timeAgo } from '@/lib/utils/format';

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(CONTENT_TYPES).map(([path, cfg]) => [path.toUpperCase(), cfg.label]),
);
const PATH_OF: Record<string, string> = CONTENT_PATHS as Record<string, string>;

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

// ── stat strip ──────────────────────────────────────────────────────────────

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group hover:bg-canvas relative flex flex-1 flex-col gap-2 px-5 py-4 transition first:rounded-l-2xl last:rounded-r-2xl"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted text-[12px] font-medium uppercase tracking-wide">{label}</span>
        <span className="bg-brand-50 text-brand-600 group-hover:bg-brand-100 flex h-8 w-8 items-center justify-center rounded-lg transition">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <div className="text-ink text-2xl font-bold leading-none tracking-tight">{value}</div>
        {sub && <div className="text-muted mt-1.5 truncate text-[11px]">{sub}</div>}
      </div>
    </Link>
  );
}

// ── attention banner ─────────────────────────────────────────────────────────

function AttentionBanner({ d }: { d: DashboardData }) {
  const needsReview = d.queue.newContacts;
  const items: { label: string; href: string }[] = [];
  if (d.content.totals.scheduled > 0) {
    items.push({
      label: `${d.content.totals.scheduled} scheduled item${d.content.totals.scheduled === 1 ? '' : 's'} ready to publish`,
      href: '/cms/content/reads?status=SCHEDULED',
    });
  }
  if (needsReview > 0) {
    items.push({
      label: `${needsReview} unread message${needsReview === 1 ? '' : 's'}`,
      href: '/cms/submissions',
    });
  }
  if (d.content.totals.draft > 0) {
    items.push({
      label: `${d.content.totals.draft} draft${d.content.totals.draft === 1 ? '' : 's'} not yet published`,
      href: '/cms/content/reads',
    });
  }
  if (items.length === 0) return null;

  return (
    <div className="border-brand-600/20 bg-brand-50 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border px-5 py-3">
      <span className="text-brand-700 flex shrink-0 items-center gap-2 text-[13px] font-semibold">
        <AlertCircle className="h-4 w-4" /> Needs attention
      </span>
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="text-brand-700 hover:text-brand-600 text-[13px] underline underline-offset-2"
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}

// ── charts ────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-16 items-end gap-1.5">
      {data.map((v, i) => (
        <div key={i} className="flex-1" title={`${v}`}>
          <div
            className="bg-brand-500/80 hover:bg-brand-600 rounded-t transition-all"
            style={{ height: `${Math.max(3, (v / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function BarRow({ label, value, max, href }: { label: string; value: number; max: number; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3 py-2">
      <span className="text-ink w-28 shrink-0 truncate text-[13px]">{label}</span>
      <div className="bg-canvas relative h-2 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-brand-500 absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }}
        />
      </div>
      <span className="text-muted w-8 shrink-0 text-right text-[13px] tabular-nums">{value}</span>
    </div>
  );
  return href ? (
    <Link href={href} className="hover:text-brand-700 -mx-1 block rounded-lg px-1">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ── activity feed ─────────────────────────────────────────────────────────
function activityText(a: DashboardData['recentActivity'][number]) {
  const verb = a.action.split('.').pop() ?? a.action;
  const noun = a.entity.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return `${a.by} ${verb} ${noun}`;
}

// ── main ──────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Everything new in Nigeria, this week." />
        <Skeleton className="h-[76px] rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = data;
  const maxByType = Math.max(1, ...Object.values(d.content.byType).map((c) => c.published));
  const maxViews = Math.max(1, ...d.views.topViewed.map((t) => t.views));
  const ls = d.newsletter.lastSent;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your content overview and key metrics" />

      <AttentionBanner d={d} />

      {/* Stat strip - Modern card-based layout */}
      <div className="border-line bg-surface grid grid-cols-2 divide-x divide-line rounded-2xl border shadow-sm sm:grid-cols-3 xl:grid-cols-6">
        <Stat icon={FileEdit} label="Published" value={d.content.totals.published} href="/cms/content/reads" />
        <Stat
          icon={FileText}
          label="Drafts"
          value={d.content.totals.draft}
          sub={d.content.totals.draft ? 'awaiting review' : 'all clear'}
          href="/cms/content/reads"
        />
        <Stat
          icon={Clock}
          label="Scheduled"
          value={d.content.totals.scheduled}
          sub={d.content.totals.scheduled ? 'ready to publish' : 'none scheduled'}
          href="/cms/content/reads?status=SCHEDULED"
        />
        <Stat icon={Eye} label="Views (7d)" value={d.views.last7d.toLocaleString()} sub="last 7 days" href="/cms/content/reads" />
        <Stat
          icon={Users2}
          label="Subscribers"
          value={d.subscribers.active.toLocaleString()}
          sub={d.subscribers.newThisWeek ? `+${d.subscribers.newThisWeek} this week` : 'no new signups'}
          href="/cms/subscribers"
        />
        <Stat
          icon={MailCheck}
          label="Newsletter"
          value={d.newsletter.next ? formatDate(d.newsletter.next, 'EEE d MMM') : 'Off'}
          sub={d.newsletter.next ? formatDate(d.newsletter.next, 'HH:mm') + ' WAT' : 'auto-draft disabled'}
          href="/cms/newsletter"
        />
      </div>

      {/* Row 2 - Content insights */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Content by type" className="shadow-sm">
          <div className="-my-1">
            {Object.entries(d.content.byType).map(([type, c]) => (
              <BarRow
                key={type}
                label={TYPE_LABEL[type] ?? type}
                value={c.published}
                max={maxByType}
                href={`/cms/content/${PATH_OF[type]}`}
              />
            ))}
          </div>
          <div className="border-line mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-muted text-[12px]">
              <span className="text-brand-600 font-semibold">{d.content.featured}</span> featured
            </span>
            <span className="text-muted text-[12px]">
              <span className="font-semibold">{d.content.totals.archived}</span> archived
            </span>
          </div>
        </Card>

        <Card title="Publishing activity" className="shadow-sm">
          <p className="text-muted text-[12px]">Items published per week · last 8 weeks</p>
          <div className="mt-3">
            <Sparkline data={d.publishedPerWeek.map((w) => w.count)} />
          </div>
          <div className="border-line mt-5 border-t pt-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink font-medium">State coverage</span>
              <span className="text-brand-600 font-bold tabular-nums">
                {d.coverage.statesWithContent} / {d.coverage.statesTotal}
              </span>
            </div>
            <div className="bg-canvas mt-2 h-2.5 overflow-hidden rounded-full">
              <div
                className="bg-brand-500 h-full rounded-full transition-all"
                style={{ width: `${pct(d.coverage.statesWithContent, d.coverage.statesTotal)}%` }}
              />
            </div>
            <p className="text-muted mt-1.5 text-[11px]">
              {pct(d.coverage.statesWithContent, d.coverage.statesTotal)}% of states have content
            </p>
          </div>
        </Card>

        <Card title="Most viewed this week" className="shadow-sm">
          {d.views.topViewed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Eye className="text-muted/30 h-12 w-12" />
              <p className="text-muted mt-2 text-[13px]">No views recorded yet</p>
            </div>
          ) : (
            <div className="-my-1">
              {d.views.topViewed.map((t) => (
                <Link
                  key={t.id}
                  href={`/cms/content/${PATH_OF[t.type]}`}
                  className="group flex items-center gap-3 py-2"
                >
                  <span className="text-ink group-hover:text-brand-700 min-w-0 flex-1 truncate text-[13px] transition">
                    {t.title}
                  </span>
                  <div className="bg-canvas relative hidden h-2 w-16 overflow-hidden rounded-full sm:block">
                    <div
                      className="bg-brand-500 absolute inset-y-0 left-0 transition-all"
                      style={{ width: `${Math.max(6, (t.views / maxViews) * 100)}%` }}
                    />
                  </div>
                  <span className="text-brand-600 w-10 shrink-0 text-right text-[13px] font-semibold tabular-nums">
                    {t.views}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 3 - Newsletter & Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Newsletter performance" className="shadow-sm">
          {ls ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/cms/newsletter/${ls.id}`}
                  className="text-ink hover:text-brand-700 truncate text-[14px] font-semibold transition"
                >
                  {ls.subject}
                </Link>
                <span className="text-muted shrink-0 text-[12px]">
                  {ls.sentAt ? `sent ${formatDate(ls.sentAt)}` : ''}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
                <div>
                  <div className="text-ink text-xl font-bold">
                    {(ls.recipientCount ?? 0).toLocaleString()}
                  </div>
                  <div className="text-muted mt-1 text-[11px] uppercase tracking-wide">Recipients</div>
                </div>
                <div>
                  <div className="text-brand-600 text-xl font-bold">
                    {pct(ls.openCount ?? 0, ls.recipientCount ?? 0)}%
                  </div>
                  <div className="text-muted mt-1 text-[11px] uppercase tracking-wide">
                    Opened ({ls.openCount ?? 0})
                  </div>
                </div>
                <div>
                  <div className="text-brand-600 text-xl font-bold">
                    {pct(ls.clickCount ?? 0, ls.recipientCount ?? 0)}%
                  </div>
                  <div className="text-muted mt-1 text-[11px] uppercase tracking-wide">
                    Clicked ({ls.clickCount ?? 0})
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MailCheck className="text-muted/30 h-12 w-12" />
              <p className="text-muted mt-2 text-[13px]">
                No issue sent yet.{' '}
                <Link href="/cms/newsletter" className="text-brand-700 font-medium hover:underline">
                  Create your first issue →
                </Link>
              </p>
            </div>
          )}
          <div className="border-line mt-4 flex items-center justify-between border-t pt-3 text-[12px]">
            <span className="text-muted">
              <span className="text-ink font-semibold">{d.newsletter.issues}</span> issue
              {d.newsletter.issues === 1 ? '' : 's'} total
            </span>
            <span className="text-muted">
              {d.newsletter.next
                ? `Next: ${formatDate(d.newsletter.next, 'EEE d MMM, HH:mm')}`
                : 'Auto-draft off'}
            </span>
          </div>
        </Card>

        <Card title="Recent activity" className="shadow-sm">
          {d.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileEdit className="text-muted/30 h-12 w-12" />
              <p className="text-muted mt-2 text-[13px]">No recent activity</p>
            </div>
          ) : (
            <ul className="divide-line -my-1 divide-y">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-ink truncate text-[13px] capitalize">{activityText(a)}</span>
                  <span className="text-muted shrink-0 text-[11px] font-medium">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
