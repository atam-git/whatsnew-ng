import type { ContentCard } from '@/lib/api/types';
import { formatDate } from './format';

const PRICE_SYMBOL: Record<string, string> = {
  BUDGET: 'Budget',
  MODERATE: 'Mid-range',
  UPSCALE: 'Upscale',
  LUXURY: 'Luxury',
};

function money(n?: number | null, currency = 'NGN') {
  if (n == null) return null;
  const sym = currency === 'NGN' ? '₦' : `${currency} `;
  if (n >= 1000) return `${sym}${Math.round(n / 1000)}k`;
  return `${sym}${n}`;
}

function mmss(s?: number | null) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** One styled fragment of a card's meta line. */
export type MetaSeg =
  | { kind: 'rating'; score: number; count?: number | null }
  | { kind: 'rank'; text: string }
  | { kind: 'price'; amount: string; unit?: string }
  | { kind: 'priceBadge'; text: string }
  | { kind: 'date'; label: string; time?: string }
  | { kind: 'strong'; text: string }
  | { kind: 'muted'; text: string }
  | { kind: 'pill'; text: string; accent?: boolean };

export interface CardMeta {
  primary: MetaSeg[];
  secondary?: string;
}

/**
 * Structured meta for a card. Returns null for types where the prose excerpt
 * is the right thing (Read, Business).
 */
export function cardMeta(item: ContentCard): CardMeta | null {
  const seg: MetaSeg[] = [];
  let secondary: string | undefined;

  switch (item.type) {
    case 'HOTEL': {
      const d = item.hotel ?? {};
      if (d.ratingRankLabel) seg.push({ kind: 'rank', text: d.ratingRankLabel });
      else if (d.rating != null)
        seg.push({ kind: 'rating', score: d.rating, count: d.reviewCount });
      if (d.pricePerNightFrom)
        seg.push({
          kind: 'price',
          amount: `from ${money(d.pricePerNightFrom, d.currency ?? 'NGN')}`,
          unit: '/night',
        });
      else if (d.priceRange) seg.push({ kind: 'priceBadge', text: PRICE_SYMBOL[d.priceRange] });
      secondary = d.neighbourhood ?? undefined;
      break;
    }
    case 'RESTAURANT': {
      const d = item.restaurant ?? {};
      if (d.ratingRankLabel) seg.push({ kind: 'rank', text: d.ratingRankLabel });
      else if (d.rating != null)
        seg.push({ kind: 'rating', score: d.rating, count: d.reviewCount });
      if (d.priceRange) seg.push({ kind: 'priceBadge', text: PRICE_SYMBOL[d.priceRange] });
      secondary = [d.cuisines?.[0], d.neighbourhood].filter(Boolean).join(' · ') || undefined;
      break;
    }
    case 'EVENT': {
      const d = item.event ?? {};
      if (d.startDateTime)
        seg.push({
          kind: 'date',
          label: formatDate(d.startDateTime, 'EEE d MMM').toUpperCase(),
          time: formatDate(d.startDateTime, 'h:mmaaa'),
        });
      if (d.isFree) seg.push({ kind: 'pill', text: 'Free', accent: true });
      else if (d.priceFrom != null)
        seg.push({ kind: 'price', amount: `from ${money(d.priceFrom, d.currency ?? 'NGN')}` });
      secondary = d.venueName ?? d.neighbourhood ?? undefined;
      break;
    }
    case 'SONG': {
      const d = item.song ?? {};
      if (d.artist) seg.push({ kind: 'strong', text: d.artist });
      secondary = d.genre?.slice(0, 2).join(', ') || undefined;
      break;
    }
    case 'VIDEO': {
      const d = item.video ?? {};
      if (d.creatorName) seg.push({ kind: 'strong', text: d.creatorName });
      const len = mmss(d.durationSeconds);
      if (len) seg.push({ kind: 'muted', text: len });
      break;
    }
    case 'STARTUP': {
      const d = item.startup ?? {};
      if (d.sector?.[0]) seg.push({ kind: 'pill', text: d.sector[0] });
      if (d.stage) seg.push({ kind: 'muted', text: d.stage });
      if (d.ycBatch) seg.push({ kind: 'muted', text: `YC ${d.ycBatch}` });
      if (d.startupStatus && d.startupStatus !== 'ACTIVE')
        seg.push({ kind: 'muted', text: d.startupStatus.replace('_', ' ').toLowerCase() });
      break;
    }
    case 'CHURCH': {
      const d = item.church ?? {};
      if (d.eventDate)
        seg.push({ kind: 'date', label: formatDate(d.eventDate, 'EEE d MMM').toUpperCase() });
      secondary = d.venueName ?? d.neighbourhood ?? undefined;
      break;
    }
    case 'OPPORTUNITY': {
      const d = item.opportunity ?? {};
      if (d.opportunityType)
        seg.push({ kind: 'pill', text: d.opportunityType.toLowerCase(), accent: true });
      if (d.deadline)
        seg.push({ kind: 'strong', text: `closes ${formatDate(d.deadline, 'd MMM')}` });
      secondary = (d.isRemote ? 'Remote' : d.locationType) ?? d.organiser ?? undefined;
      break;
    }
    case 'FILM': {
      const d = item.film ?? {};
      if (d.director) seg.push({ kind: 'strong', text: d.director });
      if (d.releaseDate) seg.push({ kind: 'muted', text: formatDate(d.releaseDate, 'd MMM yyyy') });
      secondary = d.genre?.slice(0, 2).join(', ') || undefined;
      break;
    }
    case 'AIRLINE': {
      const d = item.airline ?? {};
      if (d.routeFrom && d.routeTo) seg.push({ kind: 'strong', text: `${d.routeFrom} → ${d.routeTo}` });
      if (d.fareFrom != null)
        seg.push({ kind: 'price', amount: `from ${money(d.fareFrom, d.currency ?? 'NGN')}` });
      if (d.launchDate) secondary = formatDate(d.launchDate, 'd MMM yyyy');
      break;
    }
    case 'REAL_ESTATE': {
      const d = item.realEstate ?? {};
      if (d.developer) seg.push({ kind: 'strong', text: d.developer });
      if (d.priceFrom != null)
        seg.push({ kind: 'price', amount: `from ${money(d.priceFrom, d.currency ?? 'NGN')}` });
      secondary = d.neighbourhood ?? undefined;
      break;
    }
    case 'PODCAST': {
      const d = item.podcast ?? {};
      if (d.showName) seg.push({ kind: 'strong', text: d.showName });
      const len = mmss(d.durationSeconds);
      if (len) seg.push({ kind: 'muted', text: len });
      secondary = d.hosts?.slice(0, 2).join(', ') || undefined;
      break;
    }
    case 'VENUE': {
      const d = item.venue ?? {};
      if (d.venueType) seg.push({ kind: 'pill', text: d.venueType.replace('_', ' ').toLowerCase() });
      if (d.priceRange) seg.push({ kind: 'priceBadge', text: PRICE_SYMBOL[d.priceRange] });
      secondary = d.neighbourhood ?? undefined;
      break;
    }
    case 'EDUCATION': {
      const d = item.education ?? {};
      if (d.institution) seg.push({ kind: 'strong', text: d.institution });
      if (d.applicationDeadline)
        seg.push({ kind: 'muted', text: `apply by ${formatDate(d.applicationDeadline, 'd MMM')}` });
      secondary = d.deliveryMode ?? undefined;
      break;
    }
    default:
      return null;
  }

  if (seg.length === 0 && !secondary) return null;
  return { primary: seg, secondary };
}
