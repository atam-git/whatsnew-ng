import { ContactView } from '@/components/business/contact-view';
import { getSiteSettings } from '@/lib/api/site-settings';

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);
  return <ContactView settings={settings} />;
}
