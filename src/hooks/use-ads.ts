'use client';

import { useEffect, useState, useRef } from 'react';
import type { Ad, AdPlacement } from '@/lib/api/types';
import { useAdsContext } from '@/components/ads/ads-provider';
import { getBanners } from '@/lib/api/ads';

/**
 * useAds hook - Fetches ads for a specific placement.
 * 
 * - Provider mode: Registers with AdsProvider and uses cached batch results
 * - Standalone mode: Direct fetch if no provider exists (isolated usage)
 * 
 * Returns random ad from pool to avoid showing same campaign in multiple slots.
 */
export function useAds(placement: AdPlacement): { ad: Ad | null; isLoading: boolean } {
  const context = useAdsContext();
  const [standaloneAd, setStandaloneAd] = useState<Ad | null>(null);
  const [isLoadingStandalone, setIsLoadingStandalone] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const hasRegistered = useRef(false);

  // Provider mode - register placement once
  useEffect(() => {
    if (context && !hasRegistered.current) {
      context.registerPlacement(placement);
      hasRegistered.current = true;
    }
  }, [context, placement]);

  // Provider mode - select ad when available (only once)
  useEffect(() => {
    if (context && !context.isLoading) {
      const ad = context.getAd(placement);
      if (ad && !selectedAd) {
        setSelectedAd(ad);
      }
    }
  }, [context, placement, selectedAd]);

  // Standalone mode - direct fetch when no provider
  useEffect(() => {
    if (!context) {
      let mounted = true;
      
      const fetchAd = async () => {
        setIsLoadingStandalone(true);
        try {
          const results = await getBanners([placement]);
          const ads = results[placement];
          
          if (mounted && ads && ads.length > 0) {
            // Random selection
            const randomIndex = Math.floor(Math.random() * ads.length);
            setStandaloneAd(ads[randomIndex]);
          }
        } catch (error) {
          console.error('[useAds] Failed to fetch ad:', error);
        } finally {
          if (mounted) {
            setIsLoadingStandalone(false);
          }
        }
      };

      fetchAd();

      return () => {
        mounted = false;
      };
    }
  }, [context, placement]);

  // Return provider mode data or standalone data
  if (context) {
    return {
      ad: selectedAd,
      isLoading: context.isLoading,
    };
  }

  return {
    ad: standaloneAd,
    isLoading: isLoadingStandalone,
  };
}
