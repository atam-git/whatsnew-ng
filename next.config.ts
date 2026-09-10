import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST ?? 'media.whatsnew.ng';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: mediaHost },
      { protocol: 'http', hostname: 'localhost' },
      // demo/placeholder content only - real media comes from mediaHost
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    // Proxy /api/* to the NestJS backend so the browser stays same-origin
    // (cookies just work). Server components can also call the backend directly.
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

// Only apply the Sentry build plugin when a DSN is configured, so dev / preview
// builds don't carry the source-map tooling or SDK injection.
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      disableLogger: true,
      widenClientFileUpload: true,
      bundleSizeOptimizations: {
        excludeReplayShadowDom: true,
        excludeReplayIframe: true,
        excludeReplayWorker: true,
      },
    })
  : nextConfig;
