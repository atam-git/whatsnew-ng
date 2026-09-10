import Image from 'next/image';
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
