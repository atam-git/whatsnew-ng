import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/session';
import { env } from '@/lib/env';

function extractCookieValue(setCookieHeader: string, name: string): string | null {
  if (!setCookieHeader.startsWith(`${name}=`)) return null;
  return setCookieHeader.slice(name.length + 1).split(';')[0];
}

function loginRedirect(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = '/cms/login';
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

/**
 * Gate the CMS. Any `/cms/*` route (except the login page) needs the access
 * cookie present - full role checks happen server-side in the (cms) layout.
 *
 * The access cookie is short-lived (15m); the refresh cookie lives 30 days.
 * When the access cookie has expired but a refresh cookie is still present,
 * silently exchange it here before falling back to a login redirect -
 * otherwise every user gets bounced out every 15 minutes even though their
 * session is still valid.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/cms') || pathname === '/cms/login') {
    return NextResponse.next();
  }

  if (req.cookies.has(ACCESS_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${env.apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { cookie: req.headers.get('cookie') ?? '' },
      });
      if (refreshRes.ok) {
        const setCookies = refreshRes.headers.getSetCookie();
        const newAccessToken = setCookies
          .map((c) => extractCookieValue(c, ACCESS_COOKIE))
          .find((v): v is string => !!v);

        // Rewrite the current request's cookie header too, so the page render
        // this same middleware pass leads into sees the fresh token instead
        // of waiting for the next navigation to pick up the new cookie.
        const requestHeaders = new Headers(req.headers);
        if (newAccessToken) {
          const rest = (requestHeaders.get('cookie') ?? '')
            .split('; ')
            .filter((kv) => kv && !kv.startsWith(`${ACCESS_COOKIE}=`));
          requestHeaders.set('cookie', [...rest, `${ACCESS_COOKIE}=${newAccessToken}`].join('; '));
        }

        const res = NextResponse.next({ request: { headers: requestHeaders } });
        for (const cookie of setCookies) res.headers.append('set-cookie', cookie);
        return res;
      }
    } catch {
      // backend unreachable - fall through to login redirect
    }
  }

  return loginRedirect(req);
}

export const config = {
  matcher: ['/cms/:path*'],
};
