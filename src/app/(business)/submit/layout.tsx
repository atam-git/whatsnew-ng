import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a listing',
  description:
    'Tell us about a new place, launch, release or event in Nigeria for the Whatsnew.ng team to review.',
  alternates: { canonical: '/submit' },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
