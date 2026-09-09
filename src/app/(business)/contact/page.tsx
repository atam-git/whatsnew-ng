'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          subject: form.get('subject'),
          message: form.get('message'),
          website: form.get('website'), // honeypot
        }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold">Thanks — we&apos;ll be in touch.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold">Contact us</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          name="name"
          required
          placeholder="Your name"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <input
          name="subject"
          placeholder="Subject"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Message"
          className="border-line w-full rounded-md border px-3 py-2"
        />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="bg-brand-600 rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {state === 'loading' ? 'Sending…' : 'Send'}
        </button>
        {state === 'error' && (
          <p className="text-sm text-red-600">Something went wrong. Try again.</p>
        )}
      </form>
    </div>
  );
}
