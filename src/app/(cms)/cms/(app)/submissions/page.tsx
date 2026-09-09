import { headers } from 'next/headers';
import { apiGet } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format';

interface ListingRow {
  id: string;
  contentType: string;
  submitterName: string;
  submitterEmail: string;
  status: string;
  createdAt: string;
}

export default async function SubmissionsPage() {
  const cookie = (await headers()).get('cookie') ?? '';
  const listings = await apiGet<Paginated<ListingRow>>('/listing-submissions?status=PENDING', {
    cookie,
  }).catch(() => null);

  return (
    <div>
      <h1 className="text-xl font-bold">Submissions</h1>
      <p className="text-muted mt-2 text-sm">
        Public “Submit a listing” intake. Promote turns a pending submission into a draft content
        item for an editor to finish — never auto-published.
      </p>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-line text-muted border-b text-left">
            <th className="py-2 font-medium">Type</th>
            <th className="py-2 font-medium">From</th>
            <th className="py-2 font-medium">Received</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {listings?.data.map((row) => (
            <tr key={row.id} className="border-line/60 border-b">
              <td className="py-2 capitalize">{row.contentType.toLowerCase()}</td>
              <td className="py-2">
                {row.submitterName} <span className="text-muted">&lt;{row.submitterEmail}&gt;</span>
              </td>
              <td className="text-muted py-2">{formatDate(row.createdAt)}</td>
              <td className="py-2 text-right">
                <button className="border-line hover:bg-canvas rounded border px-2 py-1 text-xs">
                  Promote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {listings?.data.length === 0 && (
        <p className="text-muted mt-4 text-sm">Nothing pending review.</p>
      )}
      {!listings && <p className="text-muted mt-4 text-sm">Could not load submissions.</p>}
    </div>
  );
}
