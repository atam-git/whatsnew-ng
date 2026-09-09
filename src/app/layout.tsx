import type { Metadata } from 'next';
import '@/styles/globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
