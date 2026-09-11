import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Shown in place of a cover photo when a content item has none: the brand mark,
 * dimmed, on a light-gray ground. Fills its (relatively-positioned) parent.
 */
export function CoverFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-[--color-canvas]',
        className,
      )}
    >
      <Image
        src="/Whatsnew.ng.png"
        alt=""
        width={72}
        height={48}
        className="h-8 w-auto opacity-50 sm:h-10"
      />
    </div>
  );
}

/**
 * Purely decorative play-button overlay for Song/Video thumbnails - signals
 * "this is playable" at a glance. Doesn't play anything; the card itself is
 * already a link to the detail page, which has the real player.
 */
export function PlayBadge({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 flex items-center justify-center', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110',
          compact ? 'p-1.5' : 'p-3',
        )}
      >
        <Play className={cn('fill-white text-white', compact ? 'h-3 w-3' : 'h-5 w-5')} />
      </div>
    </div>
  );
}
