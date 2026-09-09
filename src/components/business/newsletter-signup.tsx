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
    <section className="bg-brand-600 rounded-2xl px-6 py-14 text-center text-white sm:px-12">
      <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        The weekly
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed opacity-95">
        New restaurants and hotels, the songs and videos worth your time, startups that just
        launched, and openings near you. One email, every Wednesday.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            disabled={status === 'loading' || status === 'success'}
            className="h-12 flex-1 rounded-lg border-2 border-white/20 bg-white/10 px-4 text-white placeholder-white/60 backdrop-blur transition focus:border-white focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="bg-ink hover:bg-ink/90 h-12 rounded-lg px-8 font-semibold text-white transition disabled:opacity-60"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <p
            className={`mt-3 text-sm ${status === 'error' ? 'text-red-100' : 'text-white/90'}`}
          >
            {message}
          </p>
        )}

        <p className="mt-4 text-xs opacity-75">
          Free, and one click to unsubscribe. We never share your address.
        </p>
      </form>
    </section>
  );
}
