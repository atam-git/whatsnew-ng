'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          totp: form.get('totp') || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Login failed');
        return;
      }
      router.replace(params.get('next') ?? '/cms');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-line bg-surface w-full max-w-sm space-y-3 rounded-xl border p-6"
    >
      <h1 className="text-lg font-bold">Whatsnew.ng CMS</h1>
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="border-line w-full rounded-md border px-3 py-2"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="border-line w-full rounded-md border px-3 py-2"
      />
      <input
        name="totp"
        inputMode="numeric"
        placeholder="2FA code (if enabled)"
        className="border-line w-full rounded-md border px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 w-full rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function CmsLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
