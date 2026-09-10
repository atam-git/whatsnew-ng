import { AboutPage } from '@/components/business/about-page';
import type { Metadata } from 'next';
import { getPage } from '@/lib/api/pages';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('about').catch(() => null);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
  };
}

export default function AboutPageRoute() {
  return <AboutPage />;
}
