'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Tooltip({ content, className }: { content: string; className?: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className={cn('text-muted hover:text-ink inline-flex items-center transition', className)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {show && (
        <div className="bg-ink absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg px-3 py-2 text-xs text-white shadow-lg">
          <div className="whitespace-normal leading-relaxed">{content}</div>
          <div className="bg-ink absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
        </div>
      )}
    </div>
  );
}
