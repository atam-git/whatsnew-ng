import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search everything new on Whatsnew.ng - places, releases, events and opportunities across Nigeria.',
  alternates: { canonical: '/search' },
  robots: { index: false },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
