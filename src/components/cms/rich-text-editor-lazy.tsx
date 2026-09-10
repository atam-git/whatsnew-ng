'use client';

import dynamic from 'next/dynamic';

/**
 * Tiptap + ProseMirror is ~80 kB of JS that only matters once an editor is on
 * screen. Loading it lazily (client-only) keeps it out of the initial CMS
 * bundle for the content / page / newsletter editors.
 */
export const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border-line bg-canvas h-40 animate-pulse rounded-lg border" />
    ),
  },
);
