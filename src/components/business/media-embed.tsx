/**
 * Playable media for detail pages — an inline player when we can build one
 * (YouTube / Vimeo / Spotify embeds, or a direct audio/video file uploaded via
 * the CMS), otherwise nothing (the "Listen" / "Watch" links in ContentFacts
 * still cover it).
 */

const FRAME =
  'aspect-video w-full overflow-hidden rounded-xl border border-line bg-black';

function youtubeId(url?: string | null, explicitId?: string | null): string | null {
  if (explicitId) return explicitId;
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

function spotifyEmbed(url?: string | null, id?: string | null): string | null {
  if (id) return `https://open.spotify.com/embed/track/${id}`;
  if (!url) return null;
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

const isAudioFile = (u?: string | null) => !!u && /\.(mp3|m4a|aac|wav|ogg|oga|flac)(\?|$)/i.test(u);
const isVideoFile = (u?: string | null) => !!u && /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(u);

export function VideoEmbed({
  videoUrl,
  videoId,
}: {
  videoUrl?: string | null;
  videoId?: string | null;
}) {
  const yt = youtubeId(videoUrl, videoId);
  if (yt) {
    return (
      <div className={FRAME}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  }
  const vm = vimeoId(videoUrl);
  if (vm) {
    return (
      <div className={FRAME}>
        <iframe
          src={`https://player.vimeo.com/video/${vm}`}
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  }
  if (isVideoFile(videoUrl)) {
    return (
      <video controls preload="metadata" className={`${FRAME} object-contain`}>
        <source src={videoUrl as string} />
      </video>
    );
  }
  return null;
}

export function SongEmbed({
  spotifyUrl,
  spotifyId,
  youtubeUrl,
  previewAudioUrl,
}: {
  spotifyUrl?: string | null;
  spotifyId?: string | null;
  youtubeUrl?: string | null;
  previewAudioUrl?: string | null;
}) {
  const spotify = spotifyEmbed(spotifyUrl, spotifyId);
  const yt = youtubeId(youtubeUrl);

  if (spotify) {
    return (
      <iframe
        src={spotify}
        title="Spotify player"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="border-line w-full rounded-xl border"
        style={{ height: 152 }}
      />
    );
  }
  if (yt) {
    return (
      <div className={FRAME}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}`}
          title="Music video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  }
  if (isAudioFile(previewAudioUrl)) {
    return <audio controls preload="none" src={previewAudioUrl as string} className="w-full" />;
  }
  return null;
}
