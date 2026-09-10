import { notFound } from 'next/navigation';
import { CONTENT_TYPES } from '@/lib/cms/content-schema';
import { ContentList } from '@/components/cms/content-list';

export default async function ContentListPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!CONTENT_TYPES[type]) notFound();
  return <ContentList type={type} />;
}
