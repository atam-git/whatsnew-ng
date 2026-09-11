'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Ad } from '@/lib/api/types';
import { trackImpression, trackClick } from '@/lib/api/ads';

interface AdBannerProps {
  ad: Ad;
}

/**
 * AdBanner - Renders an ad with impression and click tracking.
 * 
 * Uses IntersectionObserver to track impressions only when 50% visible.
 * Tracks clicks and opens ad in new tab.
 */
export function AdBanner({ ad }: AdBannerProps) {
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track impression when 50% visible
  useEffect(() => {
    if (hasTrackedImpression || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedImpression) {
            trackImpression(ad);
            setHasTrackedImpression(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% visible
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [ad, hasTrackedImpression]);

  const handleClick = () => {
    trackClick(ad);
  };

  return (
    <div ref={containerRef} className="relative">
      <a
        href={ad.click_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block transition-opacity hover:opacity-90"
        aria-label={`Advertisement - ${ad.campaign_id}`}
      >
        <Image
          src={ad.image_url}
          alt={`Advertisement - ${ad.campaign_id}`}
          width={800} // Reasonable default, CSS will handle responsive sizing
          height={400}
          className="h-auto w-full"
          priority={false}
          unoptimized // Skip Next.js optimization for external ad images
        />
      </a>
      {/* Ad label for transparency */}
      <span className="absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
        Ad
      </span>
    </div>
  );
}
