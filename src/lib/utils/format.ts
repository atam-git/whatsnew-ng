import { formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/** Nigeria has one timezone, no DST — every date shown across the app is WAT. */
export const APP_TIMEZONE = 'Africa/Lagos';

export function formatDate(value?: string | null, pattern = 'd MMM yyyy'): string {
  if (!value) return '';
  const date = parseISO(value);
  return isValid(date) ? formatInTimeZone(date, APP_TIMEZONE, pattern) : '';
}

/** Full date + time, always in WAT regardless of viewer/server locale. */
export function formatDateTime(value?: string | null, pattern = 'd MMM yyyy, h:mm a'): string {
  return formatDate(value, pattern);
}

export function timeAgo(value?: string | null): string {
  if (!value) return '';
  const date = parseISO(value);
  return isValid(date) ? `${formatDistanceToNowStrict(date)} ago` : '';
}
