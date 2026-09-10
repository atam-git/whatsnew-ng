'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Floating button that jumps to the search page. Hidden on /search itself. */
export function SearchFab() {
  const pathname = usePathname();
  if (pathname?.startsWith('/search')) return null;

  return (
    <Link
      href="/search"
      aria-label="Search"
      className="bg-brand-600 hover:bg-brand-700 fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
    >
      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
        />
      </svg>
    </Link>
  );
}
