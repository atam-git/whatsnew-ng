import type { Ad, AdPlacement, AdBannersResponse } from './types';

const API_BASE = '/api/ads';

/**
 * Fetch ad banners via internal API proxy (avoids CORS).
 * Batches multiple placement sizes into a single request.
 */
export async function getBanners(placements: AdPlacement[]): Promise<AdBannersResponse> {
  if (placements.length === 0) return {};

  const sizesParam = placements.join(',');
  const url = `${API_BASE}/banners?sizes=${sizesParam}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error('[Ads] Failed to fetch banners:', response.status);
      return {};
    }

    const data = await response.json();
    return data as AdBannersResponse;
  } catch (error) {
    console.error('[Ads] Error fetching banners:', error);
    return {};
  }
}

/**
 * Track ad impression via server-side proxy.
 * Non-blocking using fetch with keepalive.
 */
export function trackImpression(ad: Ad): void {
  if (!ad.impression_url) return;

  try {
    fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: ad.impression_url, type: 'impression' }),
      keepalive: true,
    }).catch((err) => console.error('[Ads] Impression tracking failed:', err));
  } catch (error) {
    console.error('[Ads] Error tracking impression:', error);
  }
}

/**
 * Track ad click via server-side proxy.
 * Non-blocking using fetch with keepalive.
 */
export function trackClick(ad: Ad): void {
  // The click_url already includes tracking, so we just log for analytics
  console.log('[Ads] Click tracked:', ad.campaign_id);
}
