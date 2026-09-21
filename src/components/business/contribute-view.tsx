'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORY_OPTIONS } from '@/lib/contribute/field-schema';

export function ContributeView() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/v1/contributor-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          category: form.get('category'),
          pitch: form.get('pitch'),
          link: form.get('link') || undefined,
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
      <div className="relative min-h-[60vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:py-24">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">Thanks for the pitch!</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            We review every pitch by hand. If it&apos;s a fit, we&apos;ll email you a short form to fill
            in the details.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 sm:py-16">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Pitch us a story
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Know a new place, launch, event or release we should cover? Tell us what it is and why it
            matters - if it&apos;s a fit, we&apos;ll send you a short form to fill in the details.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Your Name <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
              What kind of thing is it? <span className="text-red-600">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">
              This decides which detail form we send you if we take it further.
            </p>
          </div>

          <div>
            <label htmlFor="pitch" className="mb-2 block text-sm font-medium text-gray-700">
              Tell us about it <span className="text-red-600">*</span>
            </label>
            <textarea
              id="pitch"
              name="pitch"
              required
              rows={5}
              placeholder="What is it, and why should we cover it?"
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="link" className="mb-2 block text-sm font-medium text-gray-700">
              Link (optional)
            </label>
            <input
              id="link"
              name="link"
              type="url"
              placeholder="https://…"
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Honeypot */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <div className="flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white p-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Ready to send?</p>
              <p className="mt-1 text-xs text-gray-500">We review every pitch by hand</p>
            </div>
            <button
              type="submit"
              disabled={state === 'loading'}
              className="ml-6 inline-flex items-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'loading' ? 'Sending…' : 'Send Pitch'}
            </button>
          </div>

          {state === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Something went wrong. Please check your connection and try again.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
