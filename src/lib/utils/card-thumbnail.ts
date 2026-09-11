import type { ContentCard } from '@/lib/api/types';

/** Matches both youtube.com and music.youtube.com (same video-id scheme). */
function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function vimeoId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/** Whether a video URL is one of the two platforms we can auto-derive a
 *  thumbnail for (YouTube for free client-side, Vimeo via a cached backend
 *  oEmbed lookup) - anything else needs a manually uploaded cover. */
export function isAutoThumbnailPlatform(url?: string | null): boolean {
  return !!youtubeId(url) || !!vimeoId(url);
}

/**
 * When a Song/Video has no uploaded cover, fall back to a thumbnail derived
 * from its playable source rather than the generic brand-mark placeholder -
 * a real preview beats a blank card.
 *
 * `previewThumbnailUrl` is fetched and cached server-side on save (Spotify/
 * Apple Music/Audiomack oEmbed, or Vimeo for non-YouTube videos - see
 * `ExternalThumbnailService` on the backend) since those need a network
 * call. YouTube/YouTube Music don't - they have a free, keyless thumbnail
 * URL scheme, so it's derived here instead, and only used when there's no
 * cached one (matches the Listen-links priority: Spotify/Apple/Audiomack
 * before YouTube).
 */
export function streamingThumbnail(item: ContentCard): string | null {
  if (item.type === 'SONG') {
    if (item.song?.previewThumbnailUrl) return item.song.previewThumbnailUrl;
    const id = youtubeId(item.song?.youtubeMusicUrl);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  if (item.type === 'VIDEO') {
    const id = item.video?.videoId || youtubeId(item.video?.videoUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return item.video?.previewThumbnailUrl ?? null;
  }
  return null;
}
