import Link from 'next/link';
import type { SessionUser } from '@/lib/api/types';
import { SignOutButton } from './sign-out-button';

const CONTENT_TYPES = [
  'restaurants',
  'hotels',
  'events',
  'songs',
  'videos',
  'startups',
  'businesses',
  'churches',
  'opportunities',
  'reads',
];

export function CmsShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="border-line bg-surface w-56 shrink-0 border-r p-4 text-sm">
        <Link href="/cms" className="block text-base font-bold">
          Whatsnew<span className="text-brand-600">.ng</span>
        </Link>

        <nav className="mt-4 space-y-4">
          <div>
            <div className="text-muted mb-1 text-xs font-semibold uppercase">Content</div>
            <ul className="space-y-0.5">
              {CONTENT_TYPES.map((t) => (
                <li key={t}>
                  <Link
                    href={`/cms/content/${t}`}
                    className="hover:bg-canvas block rounded px-2 py-1 capitalize"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-muted mb-1 text-xs font-semibold uppercase">Manage</div>
            <ul className="space-y-0.5">
              {[
                ['Homepage', '/cms/homepage'],
                ['Media', '/cms/media'],
                ['Newsletter', '/cms/newsletter'],
                ['Submissions', '/cms/submissions'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:bg-canvas block rounded px-2 py-1">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="border-line bg-surface flex items-center justify-between border-b px-6 py-3 text-sm">
          <span className="text-muted">
            {user.email} · {user.role.replace('_', ' ').toLowerCase()}
          </span>
          <SignOutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
