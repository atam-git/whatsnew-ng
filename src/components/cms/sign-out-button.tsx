'use client';

import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/cms/login');
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="border-line hover:bg-canvas rounded border px-2 py-1"
      type="button"
    >
      Sign out
    </button>
  );
}
