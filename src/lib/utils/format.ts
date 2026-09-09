import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

export function formatDate(value?: string | null, pattern = 'd MMM yyyy'): string {
  if (!value) return '';
  const date = parseISO(value);
  return isValid(date) ? format(date, pattern) : '';
}

export function timeAgo(value?: string | null): string {
  if (!value) return '';
  const date = parseISO(value);
  return isValid(date) ? `${formatDistanceToNowStrict(date)} ago` : '';
}
