import { LegalPage } from '@/components/business/legal-page';
import { pageMetadata } from '@/lib/api/pages';

export const generateMetadata = () => pageMetadata('terms');

export default function TermsPageRoute() {
  return <LegalPage slug="terms" />;
}
