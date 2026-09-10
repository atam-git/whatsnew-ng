import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    "Get the Whatsnew.ng newsletter — what's new in Nigeria, in your inbox every Wednesday.",
  alternates: { canonical: '/subscribe' },
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
