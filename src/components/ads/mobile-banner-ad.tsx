import { AdSlot } from './ad-slot';

interface MobileBannerAdProps {
  className?: string;
}

/**
 * MobileBannerAd - 343x180 banner for mobile devices.
 * Typically placed between content sections on mobile/tablet.
 */
export function MobileBannerAd({ className }: MobileBannerAdProps) {
  return (
    <div className={`mx-auto flex justify-center lg:hidden ${className || ''}`}>
      <AdSlot placement="mobile_343x180" />
    </div>
  );
}
