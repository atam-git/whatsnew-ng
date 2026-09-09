'use client';

import { useState } from 'react';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'subscribe-page' }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold">The weekly</h1>
      <p className="text-muted mt-2">One email, every Wednesday. One click to unsubscribe.</p>

      {state === 'done' ? (
        <p className="bg-brand-50 text-brand-700 mt-6 rounded-md p-4">
          You&apos;re in. Check your inbox on Wednesday.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-line flex-1 rounded-md border px-3 py-2"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="bg-brand-600 rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {state === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
      )}
      {state === 'error' && (
        <p className="mt-3 text-sm text-red-600">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
