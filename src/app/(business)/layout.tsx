import { SiteFooter } from '@/components/business/site-footer';
import { SiteHeader } from '@/components/business/site-header';
import { getCities, getStates } from '@/lib/api/content';
import { getNavigation } from '@/lib/api/navigation';
import { getSiteSettings } from '@/lib/api/site-settings';

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const [cities, states, nav, settings] = await Promise.all([
    getCities().catch(() => []),
    getStates().catch(() => []),
    getNavigation().catch(() => ({})),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader cities={cities} states={states} nav={nav} />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pt-28 sm:px-6 lg:px-8">
        {children}
      </main>
      <SiteFooter nav={nav} settings={settings} />
    </div>
  );
}
