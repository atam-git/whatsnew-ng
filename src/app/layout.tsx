import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import { env } from '@/lib/env';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-dm-sans',
});

const DESCRIPTION =
  "What's new in Nigeria - the places, people, releases and openings worth knowing about, updated every week.";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: 'Whatsnew.ng - what’s new in Nigeria',
    template: '%s · Whatsnew.ng',
  },
  description: DESCRIPTION,
  applicationName: 'Whatsnew.ng',
  openGraph: {
    type: 'website',
    siteName: 'Whatsnew.ng',
    title: 'Whatsnew.ng - what’s new in Nigeria',
    description: DESCRIPTION,
    url: env.siteUrl,
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Whatsnew.ng' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whatsnew.ng',
    description: DESCRIPTION,
    images: ['/og-default.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
