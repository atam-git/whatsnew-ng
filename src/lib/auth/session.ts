import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { env } from '@/lib/env';
import type { SessionUser } from '@/lib/api/types';

export const ACCESS_COOKIE = 'wn_access';
export const REFRESH_COOKIE = 'wn_refresh';

/**
 * Reads the current admin session from the backend using the request's cookies.
 * `cache()` de-dupes it within a single render pass. Returns null if not logged in.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const cookieHeader = (await headers()).get('cookie') ?? '';
  const res = await fetch(`${env.apiUrl}/api/v1/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return (await res.json()) as SessionUser;
});

export function canPublish(user: SessionUser | null): boolean {
  return user?.role === 'SUPER_ADMIN' || user?.role === 'EDITOR';
}
