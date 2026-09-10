'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { City } from '@/lib/api/types';
import type { NavItem, NavTree } from '@/lib/api/navigation';

// Used only if the CMS navigation is empty / unreachable.
const FALLBACK_NAV = [
  { label: "What's New", href: '/about' },
  { label: 'Read', href: '/reads' },
  { label: 'Places', href: '/hotels' },
  { label: 'Music', href: '/songs' },
  { label: 'Business', href: '/businesses' },
];

// "Categories" here = the browsable content types (the user-facing meaning).
// Only show categories NOT already in the main nav
const CONTENT_TYPE_LINKS = [
  { label: 'Restaurants', href: '/restaurants' },
  { label: 'Events', href: '/events' },
  { label: 'Video', href: '/videos' },
  { label: 'Startups', href: '/startups' },
  { label: 'Faith', href: '/churches' },
  { label: 'Opportunities', href: '/opportunities' },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 6.75L9 11.25L13.5 6.75"
        stroke="currentColor"
        strokeWidth="1.6875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; href: string; active?: boolean }>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={(e) => {
          // Close if clicking outside
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
          }
        }}
        className="font-heading text-ink hover:text-brand-600 flex h-11 items-center gap-1.5 text-[16px] font-bold transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-2 min-w-[320px] animate-in fade-in slide-in-from-top-2 duration-200 rounded-lg border border-line bg-surface shadow-xl"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 p-5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded px-3 py-2 text-[15px] transition-all duration-150 hover:bg-gray-50 hover:translate-x-0.5 ${
                  item.active ? 'font-semibold text-brand-600' : 'text-ink hover:text-brand-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  cities,
  states,
  nav,
}: {
  cities?: City[];
  states?: string[];
  nav?: NavTree;
}) {
  // States with published content, from the API. Fall back to distinct states
  // on the cities list if the states endpoint returned nothing.
  const stateNames =
    states && states.length > 0
      ? states
      : [...new Set((cities ?? []).map((c) => c.state).filter((s): s is string => !!s))];
  const stateItems = stateNames.map((name) => ({
    label: name,
    href: `/?state=${encodeURIComponent(name)}`,
  }));

  // CMS-driven header nav — plain links only.
  const header: NavItem[] = nav?.HEADER ?? [];
  const topLinks = header.length
    ? header.filter((i) => i.label.toLowerCase() !== 'topics').map((i) => ({ label: i.label, href: i.href }))
    : FALLBACK_NAV;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-line bg-surface">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center transition-transform hover:scale-105">
          <img
            src="/Whatsnew.ng.png"
            alt="Whatsnew.ng"
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {stateItems.length > 0 && <Dropdown label="Location" items={stateItems} />}

          {topLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-heading text-ink hover:text-brand-600 relative text-[16px] font-bold transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}

          <Dropdown label="Categories" items={CONTENT_TYPE_LINKS} />
        </nav>

        <Link
          href="/subscribe"
          className="bg-brand-600 hover:bg-brand-700 inline-flex h-11 shrink-0 items-center justify-center rounded-full px-6 text-[16px] font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
        >
          Subscribe
        </Link>
      </div>
    </header>
  );
}
