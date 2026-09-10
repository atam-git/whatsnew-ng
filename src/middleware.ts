import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE } from '@/lib/auth/session';

/**
 * Gate the CMS. Any `/cms/*` route (except the login page) needs the access
 * cookie present - full role checks happen server-side in the (cms) layout.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/cms') && pathname !== '/cms/login') {
    const hasToken = req.cookies.has(ACCESS_COOKIE);
    if (!hasToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/cms/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/cms/:path*'],
};
