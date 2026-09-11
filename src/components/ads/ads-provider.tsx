'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Ad, AdPlacement, AdBannersResponse } from '@/lib/api/types';
import { getBanners } from '@/lib/api/ads';

interface AdsContextValue {
  registerPlacement: (placement: AdPlacement) => void;
  getAd: (placement: AdPlacement) => Ad | null;
  isLoading: boolean;
}

const AdsContext = createContext<AdsContextValue | null>(null);

export function useAdsContext() {
  return useContext(AdsContext);
}

/**
 * AdsProvider - Batches all ad slot requests on a page into a single API call.
 * 
 * Child components register placements → provider collects them → flushes in one fetch after 50ms debounce.
 * Prevents duplicate fetches and caches results.
 */
export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [adsBySize, setAdsBySize] = useState<AdBannersResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPlacements, setPendingPlacements] = useState<Set<AdPlacement>>(new Set());
  const fetchedRef = useRef<Set<AdPlacement>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Flush pending placements and fetch ads
  const flushPlacements = useCallback(async () => {
    if (pendingPlacements.size === 0) return;

    // Filter out already fetched placements
    const toFetch = Array.from(pendingPlacements).filter(
      (placement) => !fetchedRef.current.has(placement)
    );

    if (toFetch.length === 0) {
      setPendingPlacements(new Set());
      return;
    }

    setIsLoading(true);

    try {
      const results = await getBanners(toFetch);
      
      // Mark as fetched
      toFetch.forEach((placement) => fetchedRef.current.add(placement));
      
      // Merge with existing ads
      setAdsBySize((prev) => ({ ...prev, ...results }));
    } catch (error) {
      console.error('[AdsProvider] Failed to fetch ads:', error);
    } finally {
      setIsLoading(false);
      setPendingPlacements(new Set());
    }
  }, [pendingPlacements]);

  // Debounced flush - wait 50ms to collect all placements
  useEffect(() => {
    if (pendingPlacements.size === 0) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      flushPlacements();
    }, 50);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pendingPlacements, flushPlacements]);

  const registerPlacement = useCallback((placement: AdPlacement) => {
    // Skip if already fetched or pending
    if (fetchedRef.current.has(placement)) return;
    
    setPendingPlacements((prev) => {
      // Only update if placement is not already in the set
      if (prev.has(placement)) return prev;
      const next = new Set(prev);
      next.add(placement);
      return next;
    });
  }, []);

  const getAd = useCallback((placement: AdPlacement): Ad | null => {
    const ads = adsBySize[placement];
    if (!ads || ads.length === 0) return null;
    
    // Random rotation to avoid showing same campaign in multiple slots
    const randomIndex = Math.floor(Math.random() * ads.length);
    return ads[randomIndex];
  }, [adsBySize]);

  const value: AdsContextValue = {
    registerPlacement,
    getAd,
    isLoading,
  };

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}
