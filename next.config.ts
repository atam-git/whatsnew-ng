import type { NextConfig } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST ?? 'media.whatsnew.ng';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: mediaHost },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async rewrites() {
    // Proxy /api/* to the NestJS backend so the browser stays same-origin
    // (cookies just work). Server components can also call the backend directly.
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
