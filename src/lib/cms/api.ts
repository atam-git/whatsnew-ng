/** Browser-side API helper for the CMS. Same-origin via the Next `/api` rewrite,
 *  so the httpOnly auth cookie is sent automatically. */
export class CmsApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// The access-token cookie lives 15 minutes; the refresh-token cookie lives 30
// days. Without this, every request just 401s once the access token expires
// and the user gets bounced to /cms/login even though the refresh cookie is
// still valid. One in-flight refresh is shared so N concurrent 401s don't
// each fire their own /auth/refresh call.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch('/api/v1/auth/refresh', { method: 'POST' })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function cmsFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const doFetch = () =>
    fetch(`/api/v1${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });

  let res = await doFetch();
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) res = await doFetch();
  }
  if (res.status === 401 && typeof window !== 'undefined') {
    // Both tokens are dead (refresh failed too) - land on a working login
    // screen instead of leaving the user stuck on a page where every action
    // just throws.
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `/cms/login?next=${next}`;
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new CmsApiError(res.status, data.message ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json().catch(() => undefined)) as T;
}
