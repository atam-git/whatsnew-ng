import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CMS · Whatsnew.ng',
  robots: { index: false, follow: false },
};

// Bare wrapper shared by /cms/login and the authenticated area. The auth check
// lives in (app)/layout.tsx so the login page can render without a session.
export default function CmsRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-canvas min-h-screen">{children}</div>;
}
