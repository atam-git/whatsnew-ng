'use client';

import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    void import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#f4f5f7',
          color: '#101828',
        }}
      >
        <div style={{ textAlign: 'center', padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Something went wrong</h1>
          <p style={{ color: '#667085', marginTop: 8 }}>
            The page hit an unexpected error. Try reloading.
          </p>
          {/* Full reload is intentional here - the React tree is broken. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 20,
              padding: '10px 20px',
              borderRadius: 999,
              background: '#d22b1e',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
