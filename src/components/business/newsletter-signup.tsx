'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Something went wrong');
      }

      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox to confirm.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to subscribe');
    }
  }

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-br from-[#d74035] to-[#c2352a] px-8 py-12 text-center text-white shadow-lg sm:px-12 sm:py-16">
      <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        The weekly
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed">
        New restaurants and hotels, the songs and videos worth your time, startups that just
        launched, and openings near you. One email, every Wednesday.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            disabled={status === 'loading' || status === 'success'}
            className="h-12 flex-1 rounded-full border-0 bg-white px-6 text-gray-900 placeholder-gray-500 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="h-12 rounded-full bg-gray-900 px-8 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <p
            className={`mt-3 text-sm ${status === 'error' ? 'text-red-100' : 'text-white/95'}`}
          >
            {message}
          </p>
        )}

        <p className="mt-5 text-xs text-white/90">
          Free, and one click to unsubscribe. We never share your address.
        </p>
      </form>
    </div>
  );
}
