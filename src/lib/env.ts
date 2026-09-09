/** Public runtime config. Only NEXT_PUBLIC_* is available in the browser. */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  mediaHost: process.env.NEXT_PUBLIC_MEDIA_HOST ?? 'media.whatsnew.ng',
};
