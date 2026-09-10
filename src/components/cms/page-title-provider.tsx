'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface PageTitleContextValue {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs: Array<{ label: string; href?: string }>;
  setPageTitle: (title: string, subtitle?: string, actions?: ReactNode) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const [actions, setActions] = useState<ReactNode>();
  const [breadcrumbs, setBreadcrumbsState] = useState<Array<{ label: string; href?: string }>>([]);

  const setPageTitle = useCallback((newTitle: string, newSubtitle?: string, newActions?: ReactNode) => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
    setActions(newActions);
    setBreadcrumbsState([]); // Clear breadcrumbs when setting title
  }, []);

  const setBreadcrumbs = useCallback((newBreadcrumbs: Array<{ label: string; href?: string }>) => {
    setBreadcrumbsState(newBreadcrumbs);
    setTitle(''); // Clear title when setting breadcrumbs
    setSubtitle(undefined);
  }, []);

  return (
    <PageTitleContext.Provider value={{ title, subtitle, actions, breadcrumbs, setPageTitle, setBreadcrumbs }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error('usePageTitle must be used within PageTitleProvider');
  }
  return context;
}
