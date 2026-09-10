import { LegalPage } from '@/components/business/legal-page';
import { pageMetadata } from '@/lib/api/pages';

export const generateMetadata = () => pageMetadata('privacy');

export default function PrivacyPageRoute() {
  return <LegalPage slug="privacy" />;
}
