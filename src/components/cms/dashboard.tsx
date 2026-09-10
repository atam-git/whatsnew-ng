'use client';

import Link from 'next/link';
import {
  FileEdit,
  FileText,
  Eye,
  Users2,
  Inbox,
  MailCheck,
  ArrowUpRight,
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

// ── small presentational bits ──────────────────────────────────────────────

function Kpi({
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
      className="border-line bg-surface hover:border-brand-600/40 group flex items-start gap-3 rounded-2xl border p-4 transition"
    >
      <span className="bg-brand-50 text-brand-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="text-ink block text-[22px] font-bold leading-none">{value}</span>
        <span className="text-muted block text-[12px]">{label}</span>
        {sub && <span className="text-muted/80 mt-0.5 block truncate text-[11px]">{sub}</span>}
      </span>
      <ArrowUpRight className="text-muted/40 group-hover:text-brand-600 ml-auto h-4 w-4 shrink-0 transition" />
    </Link>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-16 items-end gap-1">
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
    <div className="flex items-center gap-3 py-1.5">
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
    <Link href={href} className="hover:text-brand-700 block">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = data;
  const maxByType = Math.max(1, ...Object.values(d.content.byType).map((c) => c.published));
  const maxViews = Math.max(1, ...d.views.topViewed.map((t) => t.views));
  const maxSub = Math.max(1, ...d.subscribers.topStates.map((s) => s.count));
  const ls = d.newsletter.lastSent;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Everything new in Nigeria, this week." />

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={FileEdit} label="Published" value={d.content.totals.published} href="/cms/content/reads" />
        <Kpi
          icon={FileText}
          label="Drafts"
          value={d.content.totals.draft}
          sub={d.content.totals.draft ? 'awaiting review' : undefined}
          href="/cms/content/reads"
        />
        <Kpi icon={Eye} label="Views (7d)" value={d.views.last7d.toLocaleString()} href="/cms/content/reads" />
        <Kpi
          icon={Users2}
          label="Subscribers"
          value={d.subscribers.active.toLocaleString()}
          sub={d.subscribers.newThisWeek ? `+${d.subscribers.newThisWeek} this week` : undefined}
          href="/cms/subscribers"
        />
        <Kpi
          icon={Inbox}
          label="Needs review"
          value={d.queue.pendingListings + d.queue.newContacts}
          sub={
            d.queue.pendingListings + d.queue.newContacts
              ? `${d.queue.pendingListings} listings · ${d.queue.newContacts} messages`
              : undefined
          }
          href="/cms/submissions"
        />
        <Kpi
          icon={MailCheck}
          label="Next newsletter"
          value={d.newsletter.next ? formatDate(d.newsletter.next, 'EEE d MMM') : 'Off'}
          sub={d.newsletter.next ? formatDate(d.newsletter.next, 'HH:mm') : 'auto-draft disabled'}
          href="/cms/newsletter"
        />
      </div>

      {/* Row 2 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Content by type">
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
          <p className="text-muted mt-3 text-[12px]">
            {d.content.totals.draft} draft{d.content.totals.draft === 1 ? '' : 's'} ·{' '}
            {d.content.featured} featured · {d.content.totals.archived} archived
          </p>
        </Card>

        <Card title="Publishing">
          <p className="text-muted text-[12px]">Items published per week · last 8 weeks</p>
          <div className="mt-2">
            <Sparkline data={d.publishedPerWeek.map((w) => w.count)} />
          </div>
          <div className="border-line mt-4 border-t pt-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink font-medium">State coverage</span>
              <span className="text-muted tabular-nums">
                {d.coverage.statesWithContent} / {d.coverage.statesTotal}
              </span>
            </div>
            <div className="bg-canvas mt-2 h-2 overflow-hidden rounded-full">
              <div
                className="bg-brand-500 h-full rounded-full"
                style={{ width: `${pct(d.coverage.statesWithContent, d.coverage.statesTotal)}%` }}
              />
            </div>
          </div>
        </Card>

        <Card title="Most viewed this week">
          {d.views.topViewed.length === 0 ? (
            <p className="text-muted text-[13px]">No views recorded yet.</p>
          ) : (
            <div className="-my-1">
              {d.views.topViewed.map((t) => (
                <Link
                  key={t.id}
                  href={`/cms/content/${PATH_OF[t.type]}`}
                  className="group flex items-center gap-3 py-1.5"
                >
                  <span className="text-ink group-hover:text-brand-700 min-w-0 flex-1 truncate text-[13px]">
                    {t.title}
                  </span>
                  <div className="bg-canvas relative hidden h-2 w-16 overflow-hidden rounded-full sm:block">
                    <div
                      className="bg-brand-500 absolute inset-y-0 left-0"
                      style={{ width: `${Math.max(6, (t.views / maxViews) * 100)}%` }}
                    />
                  </div>
                  <span className="text-muted w-10 shrink-0 text-right text-[13px] tabular-nums">
                    {t.views}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 3 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Newsletter">
          {ls ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/cms/newsletter/${ls.id}`}
                  className="text-ink hover:text-brand-700 truncate text-[14px] font-semibold"
                >
                  {ls.subject}
                </Link>
                <span className="text-muted shrink-0 text-[12px]">
                  {ls.sentAt ? `sent ${formatDate(ls.sentAt)}` : ''}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-ink text-[18px] font-bold">
                    {(ls.recipientCount ?? 0).toLocaleString()}
                  </div>
                  <div className="text-muted text-[11px]">recipients</div>
                </div>
                <div>
                  <div className="text-ink text-[18px] font-bold">
                    {pct(ls.openCount ?? 0, ls.recipientCount ?? 0)}%
                  </div>
                  <div className="text-muted text-[11px]">opened ({ls.openCount ?? 0})</div>
                </div>
                <div>
                  <div className="text-ink text-[18px] font-bold">
                    {pct(ls.clickCount ?? 0, ls.recipientCount ?? 0)}%
                  </div>
                  <div className="text-muted text-[11px]">clicked ({ls.clickCount ?? 0})</div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted text-[13px]">
              No issue sent yet.{' '}
              <Link href="/cms/newsletter" className="text-brand-700 font-medium">
                Build one →
              </Link>
            </p>
          )}
          <div className="border-line mt-4 flex items-center justify-between border-t pt-3 text-[12px]">
            <span className="text-muted">
              {d.newsletter.issues} issue{d.newsletter.issues === 1 ? '' : 's'} total
            </span>
            <span className="text-muted">
              {d.newsletter.next
                ? `next ${formatDate(d.newsletter.next, 'EEE d MMM, HH:mm')}`
                : 'auto-draft off'}
            </span>
          </div>
          {d.subscribers.topStates.length > 0 && (
            <div className="border-line mt-3 border-t pt-3">
              <p className="text-muted mb-1.5 text-[12px]">Subscribers by state</p>
              {d.subscribers.topStates.map((s) => (
                <BarRow key={s.state} label={s.state} value={s.count} max={maxSub} />
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent activity">
          {d.recentActivity.length === 0 ? (
            <p className="text-muted text-[13px]">Nothing yet.</p>
          ) : (
            <ul className="divide-line -my-1 divide-y">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-ink truncate text-[13px] capitalize">{activityText(a)}</span>
                  <span className="text-muted shrink-0 text-[11px]">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
