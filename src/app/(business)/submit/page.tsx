'use client';

import { useState } from 'react';
import type { ContentType } from '@/lib/api/types';

const TYPES: { value: ContentType; label: string }[] = [
  { value: 'EVENT', label: 'Event' },
  { value: 'BUSINESS', label: 'New business' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'OPPORTUNITY', label: 'Opportunity' },
];

export default function SubmitListingPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/v1/listing-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: form.get('contentType'),
          submitterName: form.get('submitterName'),
          submitterEmail: form.get('submitterEmail'),
          submitterPhone: form.get('submitterPhone') || undefined,
          website: form.get('website'), // honeypot
          payload: {
            title: form.get('title'),
            excerpt: form.get('excerpt'),
            externalUrl: form.get('externalUrl') || undefined,
          },
        }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="mx-auto max-w-lg py-10">
        <h1 className="text-2xl font-bold">Submitted for review</h1>
        <p className="text-muted mt-2">
          An editor will take a look. We publish selectively — no auto-listing.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <h1 className="text-2xl font-bold">Submit a listing</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <select
          name="contentType"
          required
          className="border-line w-full rounded-md border px-3 py-2"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          name="title"
          required
          placeholder="Name / title"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <textarea
          name="excerpt"
          rows={3}
          placeholder="One or two lines about it"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <input
          name="externalUrl"
          placeholder="Website or link"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="submitterName"
            required
            placeholder="Your name"
            className="border-line rounded-md border px-3 py-2"
          />
          <input
            name="submitterEmail"
            type="email"
            required
            placeholder="Your email"
            className="border-line rounded-md border px-3 py-2"
          />
        </div>
        <input
          name="submitterPhone"
          placeholder="Phone (optional)"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="bg-brand-600 rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {state === 'loading' ? 'Submitting…' : 'Submit'}
        </button>
        {state === 'error' && (
          <p className="text-sm text-red-600">Something went wrong. Try again.</p>
        )}
      </form>
    </div>
  );
}
