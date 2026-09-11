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

/** Twitch requires a `parent` param naming the exact domain embedding it -
 *  passed in from the page (derived from the actual request host) since it
 *  must match localhost in dev and the real domain in prod. */
function twitchEmbed(url?: string | null, siteHost?: string | null): string | null {
  if (!url || !siteHost) return null;
  const vod = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (vod) return `https://player.twitch.tv/?video=${vod[1]}&parent=${siteHost}&autoplay=false`;
  const channel = url.match(/twitch\.tv\/([A-Za-z0-9_]+)(?:$|[/?])/);
  return channel
    ? `https://player.twitch.tv/?channel=${channel[1]}&parent=${siteHost}&autoplay=false`
    : null;
}

/** Kick's embed player, unlike Twitch's, doesn't require a matching `parent`
 *  domain - a plain channel-slug URL works everywhere. */
function kickEmbed(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/kick\.com\/([A-Za-z0-9_-]+)(?:$|[/?])/);
  return m ? `https://player.kick.com/${m[1]}` : null;
}

/** Facebook's public video plugin resolves any facebook.com/fb.watch video or
 *  live URL server-side - no need to parse an id out of it ourselves. */
function facebookEmbed(url?: string | null): string | null {
  if (!url || !/(?:facebook\.com|fb\.watch)\//.test(url)) return null;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
}

function dailymotionId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

function spotifyEmbed(url?: string | null, id?: string | null): string | null {
  if (id) return `https://open.spotify.com/embed/track/${id}`;
  if (!url) return null;
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

function appleMusicEmbed(url?: string | null): string | null {
  if (!url) return null;
  // Two distinct URL shapes on music.apple.com, and the embed must match the
  // same kind or Apple's widget looks the id up against the wrong catalog
  // endpoint and silently renders empty:
  //  - a track within an album: .../album/<slug>/<albumId>?i=<trackId>
  //  - a standalone single/song page: .../song/<slug>/<songId> (no album id)
  const m = url.match(/music\.apple\.com\/([a-z]{2})\/(album|song)\/([^/]+)\/(\d+)(\?i=(\d+))?/);
  if (!m) return null;
  const [, country, kind, slug, id, , trackId] = m;
  if (kind === 'song') {
    return `https://embed.music.apple.com/${country}/song/${slug}/${id}`;
  }
  return trackId
    ? `https://embed.music.apple.com/${country}/album/${slug}/${id}?i=${trackId}`
    : `https://embed.music.apple.com/${country}/album/${slug}/${id}`;
}

function audiomackEmbed(url?: string | null): string | null {
  if (!url) return null;
  // Audiomack embeds: audiomack.com/artist/song
  // Embed format: audiomack.com/embed/song/artist/song
  const m = url.match(/audiomack\.com\/([^/]+)\/song\/([^/?]+)/);
  return m ? `https://audiomack.com/embed/song/${m[1]}/${m[2]}` : null;
}

const isVideoFile = (u?: string | null) => !!u && /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(u);

export function VideoEmbed({
  videoUrl,
  videoId,
  siteHost,
}: {
  videoUrl?: string | null;
  videoId?: string | null;
  /** Current request's host (e.g. "localhost:3000" or "whatsnew.ng") - only
   *  needed for Twitch, which requires it to match exactly. */
  siteHost?: string | null;
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
  const twitch = twitchEmbed(videoUrl, siteHost);
  if (twitch) {
    return (
      <div className={FRAME}>
        <iframe
          src={twitch}
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  }
  const kick = kickEmbed(videoUrl);
  if (kick) {
    return (
      <div className={FRAME}>
        <iframe
          src={kick}
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  }
  const facebook = facebookEmbed(videoUrl);
  if (facebook) {
    return (
      <div className={FRAME}>
        <iframe
          src={facebook}
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  }
  const dm = dailymotionId(videoUrl);
  if (dm) {
    return (
      <div className={FRAME}>
        <iframe
          src={`https://www.dailymotion.com/embed/video/${dm}`}
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
  appleMusicUrl,
  youtubeMusicUrl,
  audiomackUrl,
}: {
  spotifyUrl?: string | null;
  spotifyId?: string | null;
  appleMusicUrl?: string | null;
  youtubeMusicUrl?: string | null;
  audiomackUrl?: string | null;
}) {
  const spotify = spotifyEmbed(spotifyUrl, spotifyId);
  const appleMusic = appleMusicEmbed(appleMusicUrl);
  const yt = youtubeId(youtubeMusicUrl);
  const audiomack = audiomackEmbed(audiomackUrl);

  // Only one player at a time - priority order matches the Listen links.
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
  if (appleMusic) {
    return (
      // Apple's widget content runs a bit taller than its own nominal height,
      // tripping a native scrollbar on this cross-origin iframe.
      // scrolling="no" suppresses it.
      <iframe
        src={appleMusic}
        title="Apple Music player"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        frameBorder="0"
        loading="lazy"
        scrolling="no"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        className="border-line w-full rounded-xl border bg-transparent"
        style={{ height: 200 }}
      />
    );
  }
  if (yt) {
    return (
      // Styled to match the other streaming players (compact bar, not a big
      // video screen) - YouTube has no audio-only embed, so this is its
      // regular player constrained to look/feel like one of the audio widgets.
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${yt}`}
        title="YouTube Music player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
        className="border-line w-full rounded-xl border"
        style={{ height: 175 }}
      />
    );
  }
  if (audiomack) {
    return (
      // Audiomack's widget content runs slightly taller than its own
      // documented height, which trips a native scrollbar since it's a
      // cross-origin iframe (can't fix its internal CSS) - scrolling="no"
      // is the standard suppression for that, kept in sync with a bit of
      // headroom on the height.
      <iframe
        src={audiomack}
        title="Audiomack player"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        scrolling="no"
        className="border-line w-full rounded-xl border"
        style={{ height: 260 }}
      />
    );
  }
  return null;
}
