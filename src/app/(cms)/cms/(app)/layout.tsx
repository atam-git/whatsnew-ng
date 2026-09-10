import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { CmsShell } from '@/components/cms/cms-shell';
import { CmsProviders } from '@/components/cms/providers';

// Auth gate for the whole authenticated CMS area. Middleware already bounces
// requests with no cookie; this re-checks the session against the backend and
// resolves the user's role for the UI.
export default async function CmsAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/cms/login');

  return (
    <CmsProviders>
      <CmsShell user={user}>{children}</CmsShell>
    </CmsProviders>
  );
}
