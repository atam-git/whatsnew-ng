import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
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

export const metadata: Metadata = {
  title: {
    default: 'Whatsnew.ng',
    template: '%s · Whatsnew.ng',
  },
  description:
    "What's new in Nigeria — the places, people, releases and openings worth knowing about, updated every week.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
