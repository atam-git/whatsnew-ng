import { apiGet } from './client';

export interface SiteSettings {
  contactEmail: string;
  phone: string | null;
  addressLine: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
}

/** Site-wide contact + social details (footer + Contact page). */
export const getSiteSettings = () =>
  apiGet<SiteSettings>('/settings/site', { cache: 'no-store' });
