import { notFound } from 'next/navigation';
import { CONTENT_TYPES } from '@/lib/cms/content-schema';
import { ContentForm } from '@/components/cms/content-form';

export default async function ContentEditorPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!CONTENT_TYPES[type]) notFound();
  return <ContentForm type={type} id={id} />;
}
