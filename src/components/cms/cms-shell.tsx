'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Hotel,
  UtensilsCrossed,
  CalendarDays,
  Music2,
  Video,
  Rocket,
  Building2,
  Church,
  Briefcase,
  Tags,
  Image as ImageIcon,
  Mail,
  Users,
  Inbox,
  LayoutTemplate,
  MapPin,
  Link2,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import type { SessionUser } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';
import { SignOutButton } from './sign-out-button';
import { PageTitleProvider, usePageTitle } from './page-title-provider';

const CONTENT = [
  ['reads', 'Reads', FileText],
  ['hotels', 'Hotels', Hotel],
  ['restaurants', 'Restaurants', UtensilsCrossed],
  ['events', 'Events', CalendarDays],
  ['songs', 'Music', Music2],
  ['videos', 'Video', Video],
  ['startups', 'Startups', Rocket],
  ['businesses', 'New business', Building2],
  ['churches', 'Faith', Church],
  ['opportunities', 'Opportunities', Briefcase],
] as const;

const MANAGE = [
  ['/cms/homepage', 'Homepage', LayoutTemplate],
  ['/cms/navigation', 'Navigation', Link2],
  ['/cms/pages', 'Pages', FileText],
  ['/cms/media', 'Media', ImageIcon],
  ['/cms/tags', 'Tags', Tags],
  ['/cms/cities', 'States', MapPin],
  ['/cms/newsletter', 'Newsletter', Mail],
  ['/cms/subscribers', 'Subscribers', Users],
  ['/cms/submissions', 'Submissions', Inbox],
  ['/cms/settings', 'Settings', Settings],
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
        active ? 'bg-brand-50 text-brand-700' : 'text-muted-700 hover:bg-canvas hover:text-ink',
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
    </Link>
  );
}

function CmsShellInner({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { title, subtitle, actions, breadcrumbs } = usePageTitle();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const nav = (
    <nav 
      className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db transparent',
      }}
    >
      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      <NavLink href="/cms" label="Dashboard" icon={LayoutDashboard} active={pathname === '/cms'} onNavigate={() => setOpen(false)} />
      <div>
        <p className="text-muted px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide">
          Content
        </p>
        <div className="flex flex-col gap-0.5">
          {CONTENT.map(([slug, label, Icon]) => (
            <NavLink
              key={slug}
              href={`/cms/content/${slug}`}
              label={label}
              icon={Icon}
              active={isActive(`/cms/content/${slug}`)}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-muted px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide">
          Manage
        </p>
        <div className="flex flex-col gap-0.5">
          {MANAGE.map(([href, label, Icon]) => (
            <NavLink key={href} href={href} label={label} icon={Icon} active={isActive(href)} onNavigate={() => setOpen(false)} />
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="bg-canvas flex min-h-screen">
      {/* sidebar - desktop */}
      <aside className="border-line bg-surface fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r lg:flex">
        <Link href="/cms" className="border-line flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <Image src="/Whatsnew.ng.png" alt="Whatsnew.ng" width={72} height={48} className="h-10 w-auto" />
          <span className="text-brand-600 text-xs font-semibold uppercase tracking-wide">CMS</span>
        </Link>
        {nav}
      </aside>

      {/* sidebar - mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="bg-ink/40 absolute inset-0" onClick={() => setOpen(false)} />
          <aside className="border-line bg-surface absolute inset-y-0 left-0 flex w-64 flex-col border-r">
            <div className="border-line flex h-14 items-center justify-between border-b px-4">
              <Image src="/Whatsnew.ng.png" alt="Whatsnew.ng" width={72} height={48} className="h-10 w-auto" />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        <header className="border-line bg-surface sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            {breadcrumbs.length > 0 ? (
              <nav className="flex min-w-0 items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-muted">/</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-muted hover:text-ink truncate transition">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-ink truncate font-medium">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            ) : title ? (
              <div className="min-w-0 flex-1">
                <h1 className="text-ink truncate text-base font-semibold sm:text-lg">
                  {title}
                  {subtitle && <span className="text-muted ml-2 text-sm font-normal">· {subtitle}</span>}
                </h1>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
            <span className="text-muted hidden text-[13px] sm:inline">
              {user.email} · {user.role.replace('_', ' ').toLowerCase()}
            </span>
            <SignOutButton />
          </div>
        </header>
        <main className="mx-auto w-full flex-1 px-4 py-3 sm:px-6 sm:py-4">{children}</main>
      </div>
    </div>
  );
}

export function CmsShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <PageTitleProvider>
      <CmsShellInner user={user}>{children}</CmsShellInner>
    </PageTitleProvider>
  );
}
