import type { Metadata } from 'next';
import { ContributeView } from '@/components/business/contribute-view';

export const metadata: Metadata = {
  title: 'Pitch us a story',
  description: 'Know a new place, launch, event or release we should cover? Pitch it to Whatsnew.ng.',
  alternates: { canonical: '/contribute' },
};

export default function ContributePage() {
  return <ContributeView />;
}
