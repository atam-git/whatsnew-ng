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
      <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-2xl font-bold">The weekly</h1>
      <p className="text-muted animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 mt-2">One email, every Wednesday. One click to unsubscribe.</p>

      {state === 'done' ? (
        <p className="bg-brand-50 text-brand-700 animate-in fade-in slide-in-from-bottom-3 duration-500 mt-6 rounded-md p-4">
          You&apos;re in. Check your inbox on Wednesday.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 mt-6 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-line flex-1 rounded-md border px-3 py-2 transition-all duration-200 focus:scale-[1.01] focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="bg-brand-600 hover:bg-brand-700 rounded-md px-4 py-2 font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-60 disabled:hover:scale-100"
          >
            {state === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
      )}
      {state === 'error' && (
        <p className="animate-in fade-in slide-in-from-top-2 duration-300 mt-3 text-sm text-red-600">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
