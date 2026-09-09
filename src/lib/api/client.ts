import { env } from '@/lib/env';

const API_BASE = `${env.apiUrl}/api/v1`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Options = RequestInit & {
  /** Forwarded cookies for server-side calls (admin/CMS reads). */
  cookie?: string;
  /** Next.js fetch cache hints. */
  next?: { revalidate?: number; tags?: string[] };
};

/**
 * One fetch wrapper for both the public site and the CMS.
 * - Browser: relies on the same-origin `/api` rewrite, cookies auto-sent.
 * - Server: pass `cookie` from `headers()` for authenticated reads.
 */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { cookie, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, (body as { message?: string })?.message ?? res.statusText, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string, options?: Options) => api<T>(path, options);

export const apiSend = <T>(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  options?: Options,
) => api<T>(path, { ...options, method, body: body ? JSON.stringify(body) : undefined });
