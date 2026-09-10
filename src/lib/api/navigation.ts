import { apiGet } from './client';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  children?: NavItem[];
}

export type NavGroupKey =
  | 'HEADER'
  | 'FOOTER_PRIMARY'
  | 'FOOTER_COMPANY'
  | 'FOOTER_LEGAL'
  | 'CITY_LIST'
  | 'CATEGORY_TABS';

export type NavTree = Partial<Record<NavGroupKey, NavItem[]>>;

export const getNavigation = () =>
  apiGet<NavTree>('/navigation', { next: { revalidate: 300, tags: ['navigation'] } });
