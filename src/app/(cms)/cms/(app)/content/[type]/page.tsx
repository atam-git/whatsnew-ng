import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { apiGet } from '@/lib/api/client';
import { CONTENT_PATHS } from '@/lib/api/content';
import type { ContentCard, Paginated } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format';

const VALID = new Set<string>(Object.values(CONTENT_PATHS));

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-200 text-slate-500',
};

export default async function ContentListPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!VALID.has(type)) notFound();

  const cookie = (await headers()).get('cookie') ?? '';
  const list = await apiGet<Paginated<ContentCard>>(`/${type}?limit=50`, { cookie }).catch(
    () => null,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold capitalize">{type}</h1>
        <button className="bg-brand-600 rounded-md px-3 py-1.5 text-sm font-medium text-white">
          New {type.replace(/s$/, '')}
        </button>
      </div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-line text-muted border-b text-left">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Publish date</th>
            <th className="py-2 font-medium">Cities</th>
          </tr>
        </thead>
        <tbody>
          {list?.data.map((item) => (
            <tr key={item.id} className="border-line/60 border-b">
              <td className="py-2 font-medium">{item.title}</td>
              <td className="py-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[item.status] ?? ''}`}
                >
                  {item.status.toLowerCase()}
                </span>
              </td>
              <td className="text-muted py-2">{formatDate(item.publishDate) || '—'}</td>
              <td className="text-muted py-2">
                {item.cities.map((c) => c.name).join(', ') || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!list && (
        <p className="text-muted mt-4 text-sm">
          Could not load — is the API running on <code>NEXT_PUBLIC_API_URL</code>?
        </p>
      )}
      {list?.data.length === 0 && <p className="text-muted mt-4 text-sm">No items yet.</p>}
    </div>
  );
}
