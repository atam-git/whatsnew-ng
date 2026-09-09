import { headers } from 'next/headers';
import { apiGet } from '@/lib/api/client';

interface IssueRow {
  id: string;
  subject: string;
  status: string;
  scheduledFor?: string | null;
  sentAt?: string | null;
  _count?: { items: number };
}

export default async function NewsletterPage() {
  const cookie = (await headers()).get('cookie') ?? '';
  const issues = await apiGet<IssueRow[]>('/newsletter/issues', { cookie }).catch(() => null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Newsletter</h1>
        <button className="bg-brand-600 rounded-md px-3 py-1.5 text-sm font-medium text-white">
          New issue
        </button>
      </div>
      <p className="text-muted mt-2 text-sm">
        Autofill pulls everything published in the last 7 days; the weekly cron drafts an issue
        every Wednesday. Editor picks, previews, schedules or sends.
      </p>

      <ul className="divide-line border-line bg-surface mt-4 divide-y rounded-lg border text-sm">
        {issues?.map((issue) => (
          <li key={issue.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{issue.subject}</span>
            <span className="text-muted">
              {issue.status.toLowerCase()} · {issue._count?.items ?? 0} items
            </span>
          </li>
        ))}
        {issues?.length === 0 && <li className="text-muted px-4 py-3">No issues yet.</li>}
        {!issues && <li className="text-muted px-4 py-3">Could not load issues.</li>}
      </ul>
    </div>
  );
}
