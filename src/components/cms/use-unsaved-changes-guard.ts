import { useEffect, useRef } from 'react';

const MESSAGE = 'You have unsaved changes. Are you sure you want to leave this page?';

/**
 * Warns before leaving the page - tab close/refresh, the browser Back button,
 * or clicking an in-app link - while `isDirty` is true.
 *
 * The real Back button fires `popstate` only *after* the browser has already
 * moved to the previous entry, so `preventDefault()` on it does nothing and
 * by the time a confirm() resolves we're already gone. To actually block it,
 * we keep an extra "guard" history entry (same URL) on top of the stack while
 * dirty: the first Back press just consumes that duplicate (nothing visibly
 * navigates, since the URL is unchanged), which lets the confirm show while
 * the page is still on screen. Declining re-arms the guard; confirming lets a
 * second, real back() through.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  const guardedRef = useRef(false);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (isDirty) {
      if (!guardedRef.current) {
        window.history.pushState({ __unsavedGuard: true }, '', window.location.href);
        guardedRef.current = true;
      }
    } else {
      guardedRef.current = false;
    }
  }, [isDirty]);

  useEffect(() => {
    const handlePopState = () => {
      if (leavingRef.current) return; // this pop is the real back() we triggered below
      if (!isDirty) return; // nothing unsaved - let it navigate normally

      const confirmed = window.confirm(MESSAGE);
      if (confirmed) {
        leavingRef.current = true;
        window.history.back(); // consume the guard entry we're sitting on
      } else {
        // Re-arm: this pop already consumed the guard entry, so replace it.
        window.history.pushState({ __unsavedGuard: true }, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty]);

  // Intercept in-app link clicks (this one blocks *before* navigating, so it
  // isn't affected by the ordering problem above).
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      const isExternal = target.href.startsWith('http') && !target.href.startsWith(window.location.origin);
      const isSamePage = target.href.split('#')[0] === window.location.href.split('#')[0];
      if (isExternal || isSamePage) return;

      e.preventDefault();
      e.stopPropagation();

      if (window.confirm(MESSAGE)) {
        window.location.href = target.href;
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [isDirty]);
}
