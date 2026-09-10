import { NewsletterEditor } from '@/components/cms/newsletter-editor';

export default async function NewsletterEditorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsletterEditor id={id} />;
}
