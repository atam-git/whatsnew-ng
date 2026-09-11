'use client';

import type { AdPlacement } from '@/lib/api/types';
import { useAds } from '@/hooks/use-ads';
import { AdBanner } from './ad-banner';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

// Predefined dimensions per placement to prevent CLS (Cumulative Layout Shift)
const PLACEMENT_DIMENSIONS: Record<AdPlacement, { width: number; height: number }> = {
  leaderboard_1296x365: { width: 1296, height: 365 },
  leaderboard_1024x512: { width: 1024, height: 512 },
  leaderboard_390x964: { width: 390, height: 964 },
  mobile_343x180: { width: 343, height: 180 },
  tower_224x480: { width: 224, height: 480 }, // May not be available
};

/**
 * AdSlot - Wrapper component that handles loading states and prevents layout shift.
 * 
 * Reserves space with predefined dimensions before ad loads.
 * Shows loading placeholder to prevent CLS.
 */
export function AdSlot({ placement, className = '' }: AdSlotProps) {
  const { ad, isLoading } = useAds(placement);
  const dimensions = PLACEMENT_DIMENSIONS[placement];

  // Don't render anything if no ad available and not loading
  if (!ad && !isLoading) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
      }}
    >
      {isLoading || !ad ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <span className="text-xs text-gray-400">Loading ad...</span>
        </div>
      ) : (
        <AdBanner ad={ad} />
      )}
    </div>
  );
}
