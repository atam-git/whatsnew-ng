import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTagContent } from '@/lib/api/content';
import { ContentCard } from '@/components/business/content-card';

async function load(slug: string, page: number) {
  return getTagContent(slug, page).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await load(slug, 1);
  if (!res) return {};
  return {
    title: res.tag.name,
    description: res.tag.description ?? `Everything tagged “${res.tag.name}” on Whatsnew.ng.`,
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const res = await load(slug, page);
  if (!res) notFound();

  const { tag, data, meta } = res;

  return (
    <div>
      <header className="border-line border-b pb-6">
        <p className="text-brand-600 text-sm font-semibold uppercase tracking-wide">Tag</p>
        <h1 className="font-heading text-ink mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {tag.name}
        </h1>
        {tag.description && (
          <p className="text-muted mt-3 max-w-2xl text-[15px] leading-relaxed">{tag.description}</p>
        )}
        <p className="text-muted mt-3 text-sm">
          {meta.total} {meta.total === 1 ? 'item' : 'items'}
        </p>
      </header>

      {data.length === 0 ? (
        <p className="text-muted mt-10">Nothing published with this tag yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/tag/${slug}?page=${page - 1}`}
              className="border-line hover:border-ink rounded-full border px-4 py-2 font-semibold"
            >
              Previous
            </Link>
          )}
          <span className="text-muted">
            Page {page} of {meta.totalPages}
          </span>
          {page < meta.totalPages && (
            <Link
              href={`/tag/${slug}?page=${page + 1}`}
              className="border-line hover:border-ink rounded-full border px-4 py-2 font-semibold"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
