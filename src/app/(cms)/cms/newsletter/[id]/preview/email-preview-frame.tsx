'use client';

import { useRef, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * The rendered email sets its own light/dark colors via
 * `prefers-color-scheme`, which follows the viewer's OS theme - not
 * something you can just eyeball on demand. This toggle forces the iframe's
 * document into dark mode by adding the `.force-dark` class the email's own
 * stylesheet already understands (see backend `email-theme.ts`), so you can
 * check both renders regardless of your system theme. Works because the
 * iframe is same-origin (via the Next.js /api rewrite) + `allow-same-origin`,
 * so the parent can reach into `contentDocument` directly.
 */
export function EmailPreviewFrame({ src }: { src: string }) {
  const [dark, setDark] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const applyTheme = (isDark: boolean) => {
    const doc = frameRef.current?.contentDocument;
    doc?.documentElement.classList.toggle('force-dark', isDark);
  };

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => {
              setDark(false);
              applyTheme(false);
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              !dark ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sun className="h-3.5 w-3.5" /> Light
          </button>
          <button
            type="button"
            onClick={() => {
              setDark(true);
              applyTheme(true);
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              dark ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Moon className="h-3.5 w-3.5" /> Dark
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <iframe
          ref={frameRef}
          src={src}
          title="Email preview"
          className="h-[80vh] w-full bg-white"
          sandbox="allow-same-origin"
          onLoad={() => applyTheme(dark)}
        />
      </div>
    </div>
  );
}
