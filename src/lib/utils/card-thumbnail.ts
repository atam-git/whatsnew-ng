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

export type SongThumbnailSources = {
  spotifyUrl?: string | null;
  spotifyId?: string | null;
  appleMusicUrl?: string | null;
  youtubeMusicUrl?: string | null;
  audiomackUrl?: string | null;
  previewThumbnailUrl?: string | null;
};

export type PodcastThumbnailSources = {
  spotifyUrl?: string | null;
  applePodcastsUrl?: string | null;
  youtubeUrl?: string | null;
  previewThumbnailUrl?: string | null;
};

/**
 * When a Song/Video/Podcast has no uploaded cover, fall back to artwork from
 * its playable source.
 *
 * Song: Spotify → Apple Music → YouTube Music → Audiomack (matches SongEmbed).
 * Podcast: Spotify → Apple Podcasts → YouTube (matches PodcastEmbed).
 * Never show a lower-ranked platform's art while a higher-ranked link owns
 * the player.
 *
 * `previewThumbnailUrl` is cached server-side on save for Spotify / Apple /
 * Audiomack. YouTube is derived client-side (free hqdefault URL).
 */
export function streamingThumbnail(item: {
  type: string;
  song?: SongThumbnailSources | null;
  podcast?: PodcastThumbnailSources | null;
  video?: {
    videoId?: string | null;
    videoUrl?: string | null;
    previewThumbnailUrl?: string | null;
  } | null;
}): string | null {
  if (item.type === 'SONG') {
    const song = item.song;
    if (!song) return null;

    if (song.spotifyUrl || song.spotifyId) {
      return song.previewThumbnailUrl ?? null;
    }
    if (song.appleMusicUrl) {
      return song.previewThumbnailUrl ?? null;
    }
    if (song.youtubeMusicUrl) {
      const id = youtubeId(song.youtubeMusicUrl);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    if (song.audiomackUrl) {
      return song.previewThumbnailUrl ?? null;
    }
    return null;
  }
  if (item.type === 'PODCAST') {
    const podcast = item.podcast;
    if (!podcast) return null;

    if (podcast.spotifyUrl) {
      return podcast.previewThumbnailUrl ?? null;
    }
    if (podcast.applePodcastsUrl) {
      return podcast.previewThumbnailUrl ?? null;
    }
    if (podcast.youtubeUrl) {
      const id = youtubeId(podcast.youtubeUrl);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    return null;
  }
  if (item.type === 'VIDEO') {
    const id = item.video?.videoId || youtubeId(item.video?.videoUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return item.video?.previewThumbnailUrl ?? null;
  }
  return null;
}
