import { WorkWithUsPage } from '@/components/business/work-with-us-page';
import { pageMetadata } from '@/lib/api/pages';

export const generateMetadata = () => pageMetadata('work-with-us');

export default function WorkWithUsPageRoute() {
  return <WorkWithUsPage />;
}
