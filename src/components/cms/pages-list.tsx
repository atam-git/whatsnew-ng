'use client';

import { useRouter } from 'next/navigation';
import { usePages, type PageRow } from '@/lib/cms/admin-hooks';
import { PageHeader, DataTable, EmptyState, type Column } from './ui';
import { formatDate } from '@/lib/utils/format';

const KNOWN = ['about', 'work-with-us', 'privacy', 'terms'];
const order = (slug: string) => {
  const i = KNOWN.indexOf(slug);
  return i === -1 ? 99 : i;
};

export function PagesList() {
  const router = useRouter();
  const { data, isLoading } = usePages();

  const rows = [...(data ?? [])].sort((a, b) => order(a.slug) - order(b.slug));

  const columns: Column<PageRow>[] = [
    { key: 'title', header: 'Page', primary: true, cell: (r) => r.title },
    { key: 'slug', header: 'URL', cell: (r) => <span className="text-muted text-[13px]">/{r.slug}</span> },
    { key: 'updated', header: 'Last updated', cell: (r) => <span className="text-muted text-[12px]">{formatDate(r.updatedAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Pages"
        subtitle="The site's standing pages. Edit their content here - they can't be added or removed."
      />
      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        onRowClick={(r) => router.push(`/cms/pages/${r.id}`)}
        empty={
          <EmptyState
            title="No pages found"
            description="Run npm run db:seed in the backend to create them."
          />
        }
      />
    </div>
  );
}
