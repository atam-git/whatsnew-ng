'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ContentType } from '@/lib/api/types';

const TYPES: { value: ContentType; label: string; icon: string }[] = [
  { value: 'EVENT', label: 'Event', icon: '🎉' },
  { value: 'BUSINESS', label: 'Business', icon: '🏢' },
  { value: 'RESTAURANT', label: 'Restaurant', icon: '🍽️' },
  { value: 'HOTEL', label: 'Hotel', icon: '🏨' },
  { value: 'OPPORTUNITY', label: 'Opportunity', icon: '💼' },
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
      <div className="relative min-h-[60vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        
        <div className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:py-24">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
            Submitted for Review
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Thanks for your submission! Our editorial team will review it carefully. We publish
            selectively to maintain quality — no auto-listing.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setState('idle')}
              className="inline-flex items-center rounded-full border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
            >
              Submit Another
            </button>
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
    <div className="relative bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Compact Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
            Submit a Listing
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Share something new and noteworthy — we&apos;ll review and publish if it&apos;s a good fit
          </p>
        </div>
      </div>

      {/* Compact Form */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
          {/* Type Selection - Compact Pills */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              What type? <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <label
                  key={type.value}
                  className="group relative cursor-pointer"
                >
                  <input
                    type="radio"
                    name="contentType"
                    value={type.value}
                    defaultChecked={type.value === 'EVENT'}
                    required
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium transition peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-700 hover:border-gray-300">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Two Column Grid for Main Fields */}
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
                Name / Title <span className="text-red-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g., The Jazz Cafe"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-gray-700">
                Brief Description
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                placeholder="One or two lines about what makes it noteworthy..."
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="externalUrl" className="mb-1.5 block text-sm font-medium text-gray-700">
                Website or Link
              </label>
              <input
                id="externalUrl"
                name="externalUrl"
                type="url"
                placeholder="https://..."
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Divider */}
            <div className="sm:col-span-2 border-t border-gray-200 my-2"></div>

            {/* Contact Info - Same Row */}
            <div>
              <label htmlFor="submitterName" className="mb-1.5 block text-sm font-medium text-gray-700">
                Your Name <span className="text-red-600">*</span>
              </label>
              <input
                id="submitterName"
                name="submitterName"
                type="text"
                required
                placeholder="John Doe"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label htmlFor="submitterEmail" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="submitterEmail"
                name="submitterEmail"
                type="email"
                required
                placeholder="you@example.com"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="submitterPhone" className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="submitterPhone"
                name="submitterPhone"
                type="tel"
                placeholder="+234..."
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Honeypot */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          {/* Compact Submit Section */}
          <div className="mt-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              We review every submission • Usually within 2-3 days
            </p>
            <button
              type="submit"
              disabled={state === 'loading'}
              className="inline-flex items-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {state === 'loading' ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>

          {state === 'error' && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                Something went wrong. Please check your connection and try again.
              </p>
            </div>
          )}
        </form>

        {/* Compact Info */}
        <div className="mt-6 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 p-4">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-medium text-gray-900">What happens next?</strong> Our editorial team reviews your submission, may reach out for more details, and publishes if approved. Nothing goes live automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
