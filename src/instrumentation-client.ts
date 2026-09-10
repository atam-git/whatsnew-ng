// Sentry (browser), loaded only when a DSN is configured so no-DSN builds carry
// zero Sentry weight in the client bundle.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  });
}
