'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@/lib/utils/format';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiAudiomack, SiInstagram, SiX } from 'react-icons/si';
import { Globe } from 'lucide-react';

type Fact = { label: string; value: React.ReactNode };

function money(n?: number | null, currency = 'NGN') {
  if (n == null) return null;
  const sym = currency === 'NGN' ? '₦' : `${currency} `;
  return `${sym}${n.toLocaleString()}`;
}

function ratingLine(d: any): React.ReactNode {
  const rating = d.rating != null ? Number(d.rating) : null;
  const fullStars = rating != null ? Math.floor(rating) : 0;
  const hasHalfStar = rating != null && rating % 1 >= 0.5;
  
  const stars = rating != null ? (
    <span className="text-yellow-500">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      <span className="text-gray-300">{'★'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}</span>
    </span>
  ) : null;

  if (d.ratingRankLabel && d.rating)
    return (
      <span className="flex items-center gap-2">
        {stars} {d.rating} · {d.ratingRankLabel} ({(d.ratingSource ?? '').toLowerCase()})
      </span>
    );
  if (d.ratingRankLabel) return d.ratingRankLabel;
  if (rating != null)
    return (
      <span className="flex items-center gap-2">
        {stars} {d.rating}
        {d.reviewCount ? ` · ${d.reviewCount.toLocaleString()} reviews` : ''}
        {d.ratingSource ? ` (${String(d.ratingSource).toLowerCase()})` : ''}
      </span>
    );
  return null;
}

function list(v?: string[] | null): React.ReactNode {
  if (!v || v.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {v.map((x) => (
        <span key={x} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[13px] text-gray-700">
          {x}
        </span>
      ))}
    </span>
  );
}

function hoursTable(obj?: Record<string, unknown> | null): React.ReactNode {
  if (!obj || typeof obj !== 'object') return null;
  const rows = Object.entries(obj).filter(([, v]) => typeof v === 'string');
  if (rows.length === 0) return null;
  return (
    <ul className="space-y-0.5">
      {rows.map(([k, v]) => (
        <li key={k}>
          <span className="inline-block w-24 capitalize text-gray-500">{k}</span>
          {String(v)}
        </li>
      ))}
    </ul>
  );
}

function link(url?: string | null, label?: string): React.ReactNode {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-red-600 hover:underline"
    >
      {label ?? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
    </a>
  );
}

function build(section: string, item: any): Fact[] {
  const d =
    item.restaurant ??
    item.hotel ??
    item.event ??
    item.song ??
    item.video ??
    item.startup ??
    item.business ??
    item.church ??
    item.opportunity ??
    item.read ??
    item.film ??
    item.airline ??
    item.realEstate ??
    item.podcast ??
    item.venue ??
    item.education ??
    {};
  const f: (Fact | false | null | undefined)[] = [];
  const push = (label: string, value: React.ReactNode) => {
    if (value != null && value !== '' && !(Array.isArray(value) && value.length === 0))
      f.push({ label, value });
  };

  switch (section) {
    case 'hotels':
    case 'restaurants':
      push('Rating', ratingLine(d));
      if (d.reviewQuote)
        push(
          'Review',
          <span className="text-gray-600 italic">
            “{d.reviewQuote}” <span className="not-italic">- {d.reviewQuoteAuthor ?? 'reviewer'}</span>
          </span>,
        );
      push('Location', [d.neighbourhood, d.address].filter(Boolean).join(' · ') || null);
      push('Price', section === 'hotels' ? money(d.pricePerNightFrom, d.currency) && `from ${money(d.pricePerNightFrom, d.currency)} / night` : d.priceRange && String(d.priceRange).toLowerCase());
      push(
        section === 'hotels' ? 'Class' : 'Cuisine',
        section === 'hotels'
          ? d.starRating
            ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-yellow-500">{'★'.repeat(d.starRating)}</span>
                  <span className="text-gray-600">{d.starRating}-star</span>
                </span>
              )
            : null
          : list(d.cuisines)
      );
      push(section === 'hotels' ? 'Amenities' : 'Signature dishes', list(section === 'hotels' ? d.amenities : d.signatureDishes));
      if (section === 'hotels') push('Check-in / out', d.checkInTime ? `${d.checkInTime} / ${d.checkOutTime ?? '-'}` : null);
      if (section === 'restaurants') {
        push('Hours', hoursTable(d.hoursOfOperation));
        push('Opened', d.openedYear);
      }
      push('Phone', d.phone);
      push(section === 'hotels' ? 'Book' : 'Reserve', link(d.bookingUrl ?? d.reservationUrl));
      push('Menu', link(d.menuUrl));
      break;

    case 'events':
      push('When', d.startDateTime ? `${formatDate(d.startDateTime, 'EEE d MMM, h:mma')}${d.endDateTime && d.endDateTime !== d.startDateTime ? ` – ${formatDate(d.endDateTime, 'd MMM')}` : ''}` : null);
      push('Venue', [d.venueName, d.neighbourhood].filter(Boolean).join(' · ') || null);
      push('Organiser', d.organiser);
      push('Lineup', list(d.lineup));
      push('Price', d.isFree ? 'Free' : d.priceFrom != null ? `${money(d.priceFrom, d.currency)}${d.priceTo ? `–${money(d.priceTo, d.currency)}` : ''}` : null);
      push('Age', d.ageRestriction);
      push('Capacity', d.capacity ? d.capacity.toLocaleString() : null);
      push('Tickets', link(d.ticketUrl, d.ticketProvider ? `Get tickets (${d.ticketProvider})` : 'Get tickets'));
      break;

    case 'songs':
      push('Artist', [d.artist, ...(d.featuredArtists ?? [])].filter(Boolean).join(', '));
      push('Released', d.releaseDate ? formatDate(d.releaseDate, 'd MMM yyyy') : null);
      push('Type', d.isAlbum ? `Album${d.trackCount ? ` · ${d.trackCount} tracks` : ''}` : 'Single/EP');
      push('Genre', list(d.genre));
      push('Label', d.label);
      push('Producer', d.producer);
      if (!d.isAlbum && d.durationSeconds)
        push('Length', `${Math.floor(d.durationSeconds / 60)}:${String(d.durationSeconds % 60).padStart(2, '0')}`);
      push(
        'Listen',
        (d.spotifyUrl || d.appleMusicUrl || d.youtubeMusicUrl || d.audiomackUrl) && (
          <span className="flex flex-wrap gap-3">
            {d.spotifyUrl && (
              <a href={d.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
                <SiSpotify className="h-4 w-4" />
                Spotify
              </a>
            )}
            {d.appleMusicUrl && (
              <a href={d.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
                <SiApplemusic className="h-4 w-4" />
                Apple Music
              </a>
            )}
            {d.youtubeMusicUrl && (
              <a href={d.youtubeMusicUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
                <SiYoutubemusic className="h-4 w-4" />
                YouTube Music
              </a>
            )}
            {d.audiomackUrl && (
              <a href={d.audiomackUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
                <SiAudiomack className="h-4 w-4" />
                Audiomack
              </a>
            )}
          </span>
        ),
      );
      break;

    case 'videos':
      push('Creator', d.creatorName);
      push('Channel', link(d.channelUrl));
      push('Length', d.durationSeconds ? `${Math.floor(d.durationSeconds / 60)}:${String(d.durationSeconds % 60).padStart(2, '0')}` : null);
      push('Views', d.externalViews ? d.externalViews.toLocaleString() : null);
      push('Published', d.externalPublishedAt ? formatDate(d.externalPublishedAt, 'd MMM yyyy') : null);
      push('Topics', list(d.topics));
      push('Series', d.series);
      break;

    case 'startups':
      push('Tagline', d.tagline);
      push('Sector', list(d.sector));
      push('Stage', d.stage);
      push('Batch', d.ycBatch ? `Y Combinator ${d.ycBatch}` : null);
      push('Status', d.startupStatus ? String(d.startupStatus).replace('_', ' ').toLowerCase() : null);
      push('Founded', d.foundedYear);
      push('HQ', d.hqCity);
      push('Team', d.teamSize);
      push('Funding', d.fundingRaised);
      push('Founders', (d.foundersNames ?? []).join(', ') || null);
      push('Links', (d.website || d.linkedinUrl || d.twitterUrl) && (
        <span className="flex flex-wrap gap-3">
          {link(d.website, 'Website')}
          {link(d.linkedinUrl, 'LinkedIn')}
          {link(d.twitterUrl, 'X')}
        </span>
      ));
      break;

    case 'businesses':
      push('Tagline', d.tagline);
      push('Sector', list(d.sector.length ? d.sector : d.industry ? [d.industry] : []));
      push('Founded', d.foundedYear);
      push('HQ', [d.neighbourhood, d.hqCity].filter(Boolean).join(', ') || null);
      push('Price', d.priceRange ? String(d.priceRange).toLowerCase() : null);
      push(
        'Contact',
        (d.phone || d.email) && (
          <span className="flex flex-wrap items-center gap-1.5">
            {d.phone && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(d.phone);
                }}
                className="cursor-pointer text-gray-800 hover:text-red-600 hover:underline transition"
                title="Click to copy"
              >
                {d.phone}
              </button>
            )}
            {d.phone && d.email && <span className="text-gray-400">·</span>}
            {d.email && (
              <a href={`mailto:${d.email}`} className="text-red-600 hover:underline">
                {d.email}
              </a>
            )}
          </span>
        ),
      );
      push('Links', (d.website || d.instagramUrl || d.twitterUrl) && (
        <span className="flex flex-wrap gap-3">
          {d.website && (
            <a href={d.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
              <Globe className="h-4 w-4" />
              Website
            </a>
          )}
          {d.instagramUrl && (
            <a href={d.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
              <SiInstagram className="h-4 w-4" />
              Instagram
            </a>
          )}
          {d.twitterUrl && (
            <a href={d.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline">
              <SiX className="h-4 w-4" />
              X
            </a>
          )}
        </span>
      ));
      break;

    case 'churches':
      push('Host', d.hostOrSpeaker);
      push('Date', d.eventDate ? formatDate(d.eventDate, 'EEE d MMM, h:mma') : null);
      push('Venue', [d.venueName, d.neighbourhood].filter(Boolean).join(' · ') || null);
      push('Denomination', d.denomination);
      push('Service times', hoursTable(d.serviceTimes));
      push('Guests', list(d.guestSpeakers));
      push('Register', link(d.registrationUrl));
      push(
        'Contact',
        d.contactPhone && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(d.contactPhone);
            }}
            className="cursor-pointer text-gray-800 hover:text-red-600 hover:underline transition"
            title="Click to copy"
          >
            {d.contactPhone}
          </button>
        ),
      );
      break;

    case 'opportunities':
      push('Type', d.opportunityType ? String(d.opportunityType).toLowerCase() : null);
      push('Organiser', d.organiser);
      push('Deadline', d.deadline ? formatDate(d.deadline, 'd MMM yyyy') : null);
      push('Starts', d.startDate ? formatDate(d.startDate, 'd MMM yyyy') : null);
      push('Compensation', d.compensation);
      push('Location', [d.locationType, d.isRemote ? 'remote' : null].filter(Boolean).join(' · ') || null);
      push('Duration', d.duration);
      push('Level', d.experienceLevel);
      push('Fields', list(d.fields));
      push('Benefits', list(d.benefits));
      push('Eligibility', d.eligibility);
      push('Apply', link(d.applyUrl));
      break;

    case 'reads':
      push('Author', [d.author, d.authorTitle].filter(Boolean).join(', ') || null);
      push('Reading time', d.readingTimeMinutes ? `${d.readingTimeMinutes} min` : null);
      if (d.keyTakeaways?.length)
        push(
          'Key takeaways',
          <ul className="list-disc space-y-1 pl-4">
            {d.keyTakeaways.map((t: string) => (
              <li key={t}>{t}</li>
            ))}
          </ul>,
        );
      push('Sources', (d.sources ?? []).join(' · ') || null);
      push('Note', d.updatedNote);
      break;

    case 'films':
      push('Director', d.director);
      push('Cast', list(d.cast));
      push('Genre', list(d.genre));
      push('Runtime', d.runtimeMinutes ? `${d.runtimeMinutes} min` : null);
      push('Release', d.releaseType ? String(d.releaseType).replace('_', ' ').toLowerCase() : null);
      push('Release date', d.releaseDate ? formatDate(d.releaseDate, 'd MMM yyyy') : null);
      push('Streaming on', d.streamingPlatform);
      push('Cinemas', list(d.cinemaChains));
      push('Rating', d.ageRating);
      push('Production', d.productionCompany);
      push('Trailer', link(d.trailerUrl, 'Watch trailer'));
      push('Tickets', link(d.ticketUrl, 'Get tickets'));
      break;

    case 'airlines':
      push('Route', [d.routeFrom, d.routeTo].filter(Boolean).join(' → ') || null);
      push('Launch date', d.launchDate ? formatDate(d.launchDate, 'd MMM yyyy') : null);
      push('Hub', d.hubAirport);
      push('Fleet', d.fleetType);
      push('Frequency', d.frequency);
      push('Fare from', money(d.fareFrom, d.currency));
      push('Book', link(d.bookingUrl, 'Book tickets'));
      push('Website', link(d.airlineWebsite));
      break;

    case 'real-estate':
      push('Developer', d.developer);
      push('Type', d.propertyType ? String(d.propertyType).replace('_', ' ').toLowerCase() : null);
      push('Unit types', list(d.unitTypes));
      push('Price from', money(d.priceFrom, d.currency));
      push('Location', [d.neighbourhood, d.address].filter(Boolean).join(' · ') || null);
      push('Completion', d.completionDate ? formatDate(d.completionDate, 'd MMM yyyy') : null);
      push('Payment plan', d.paymentPlan);
      push('Amenities', list(d.amenities));
      push('Sales', d.salesPhone);
      push('Brochure', link(d.brochureUrl));
      break;

    case 'podcasts':
      push('Show', d.showName);
      push('Episode', d.episodeTitle);
      push('Hosts', list(d.hosts));
      push('Topics', list(d.topics));
      if (d.durationSeconds)
        push('Length', `${Math.floor(d.durationSeconds / 60)}:${String(d.durationSeconds % 60).padStart(2, '0')}`);
      push(
        'Listen',
        (d.spotifyUrl || d.applePodcastsUrl || d.youtubeUrl) && (
          <span className="flex flex-wrap gap-3">
            {link(d.spotifyUrl, 'Spotify')}
            {link(d.applePodcastsUrl, 'Apple Podcasts')}
            {link(d.youtubeUrl, 'YouTube')}
          </span>
        ),
      );
      break;

    case 'venues':
      push('Type', d.venueType ? String(d.venueType).replace('_', ' ').toLowerCase() : null);
      push('Capacity', d.capacity ? d.capacity.toLocaleString() : null);
      push('Location', [d.neighbourhood, d.address].filter(Boolean).join(' · ') || null);
      push('Amenities', list(d.amenities));
      push('Price range', d.priceRange ? String(d.priceRange).toLowerCase() : null);
      push('Hours', hoursTable(d.openingHours));
      push('Book', link(d.bookingUrl));
      push('Contact', d.contactPhone);
      break;

    case 'education':
      push('Institution', d.institution);
      push('Program', d.programType ? String(d.programType).toLowerCase() : null);
      push('Duration', d.duration);
      push('Tuition', money(d.tuition, d.currency));
      push('Delivery', d.deliveryMode);
      push('Location', d.neighbourhood);
      push('Deadline', d.applicationDeadline ? formatDate(d.applicationDeadline, 'd MMM yyyy') : null);
      push('Starts', d.startDate ? formatDate(d.startDate, 'd MMM yyyy') : null);
      push('Eligibility', d.eligibility);
      push('Apply', link(d.applyUrl));
      break;
  }

  return f.filter(Boolean) as Fact[];
}

export function ContentFacts({ item, section }: { item: unknown; section: string }) {
  const it = item as any;
  const facts = build(section, it);
  const d = it.restaurant ?? it.hotel ?? it.event ?? it.business ?? it.church ?? it.realEstate ?? it.venue ?? {};
  const mapUrl: string | undefined = d.mapUrl;

  // Google's "Share" button gives an opaque maps.app.goo.gl / goo.gl/maps short
  // link — there's no way to resolve that client-side, so it can't be embedded
  // or parsed for coordinates. Geocode from the venue's own address instead
  // (falling back to title + neighbourhood + city) and keep mapUrl only as an
  // "open in Google Maps" link alongside the embed.
  const cityName: string | undefined = it.cities?.[0]?.name;
  const locationQuery: string =
    d.address || [it.title, d.neighbourhood, cityName, 'Nigeria'].filter(Boolean).join(', ');

  const getMapEmbedUrl = (url: string): string => {
    // A full Google Maps URL (not a short link) sometimes carries @lat,lng —
    // use it directly when present, it's more precise than a text query.
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const [, lat, lng] = coordMatch;
      return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;
  };

  // Only content types with a mapUrl field (hotels, restaurants, events,
  // churches, businesses, real estate, venues) get a map — no map section at
  // all otherwise, and never one guessed purely from title/city for types
  // like music or reads.
  const embedUrl = mapUrl ? getMapEmbedUrl(mapUrl) : null;

  if (facts.length === 0 && !mapUrl) return null;

  return (
    <>
      {facts.length > 0 && (
        <dl className="mt-8 grid gap-x-8 gap-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-5 sm:grid-cols-[10rem_1fr]">
          {facts.map((f, i) => (
            <div key={i} className="contents">
              <dt className="text-sm font-semibold text-gray-500 sm:pt-0.5">{f.label}</dt>
              <dd className="text-[15px] text-gray-800">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      
      {embedUrl && mapUrl && (
        <div className="mt-6">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <iframe
              src={embedUrl}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location map"
              className="w-full"
            />
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-red-600 hover:underline"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open in Google Maps
          </a>
        </div>
      )}
    </>
  );
}
