import { AdSlot } from './ad-slot';

interface LeaderboardAdProps {
  className?: string;
}

/**
 * LeaderboardAd - 1296x365 banner ad for desktop.
 * Typically placed at page top or between content sections.
 */
export function LeaderboardAd({ className }: LeaderboardAdProps) {
  return (
    <div className={`mx-auto flex justify-center ${className || ''}`}>
      <AdSlot placement="leaderboard_1296x365" />
    </div>
  );
}
