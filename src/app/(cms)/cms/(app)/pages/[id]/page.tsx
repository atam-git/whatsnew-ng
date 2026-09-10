import { PageEditor } from '@/components/cms/page-editor';

export default async function CmsPageEditorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PageEditor id={id} />;
}
