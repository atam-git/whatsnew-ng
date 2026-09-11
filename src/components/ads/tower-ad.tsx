import { AdSlot } from './ad-slot';

interface TowerAdProps {
  className?: string;
}

/**
 * TowerAd - 224x480 vertical banner for sidebar.
 * Typically placed in desktop sidebar on content pages.
 */
export function TowerAd({ className }: TowerAdProps) {
  return (
    <div className={`hidden lg:block ${className || ''}`}>
      <AdSlot placement="tower_224x480" />
    </div>
  );
}
