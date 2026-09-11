'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { usePageTitle } from '../page-title-provider';

export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  const { setPageTitle, setBreadcrumbs } = usePageTitle();

  useEffect(() => {
    if (backHref) {
      // Detail page - set breadcrumbs in header (no actions in header)
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const breadcrumbs = [];
      
      // Build breadcrumbs from path
      if (pathParts[1] === 'content' && pathParts[2]) {
        const typeLabel = pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1);
        breadcrumbs.push({ label: typeLabel, href: `/cms/content/${pathParts[2]}` });
      } else if (pathParts[1]) {
        const label = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
        breadcrumbs.push({ label, href: `/${pathParts.slice(0, 2).join('/')}` });
      }
      
      breadcrumbs.push({ label: title });
      setBreadcrumbs(breadcrumbs);
    } else {
      // List page - set title in header with actions
      setPageTitle(title, subtitle, actions);
    }
  }, [title, subtitle, actions, backHref, setPageTitle, setBreadcrumbs]);

  // For detail pages, render the title and back button in the content area
  if (backHref) {
    return (
      <div className="bg-canvas sticky top-14 z-20 -mx-4 -mt-3 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:-mx-6 sm:-mt-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="border-line text-muted hover:text-ink flex h-8 w-8 items-center justify-center rounded-full border transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-ink text-[20px] font-bold leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-muted mt-0.5 text-[13px]">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }

  // For list pages, the header shows in the CMS shell
  return null;
}
