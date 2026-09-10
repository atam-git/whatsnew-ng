/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@/lib/utils/format';

type Fact = { label: string; value: React.ReactNode };

function money(n?: number | null, currency = 'NGN') {
  if (n == null) return null;
  const sym = currency === 'NGN' ? '₦' : `${currency} `;
  return `${sym}${n.toLocaleString()}`;
}

function ratingLine(d: any): string | null {
  if (d.ratingRankLabel && d.rating)
    return `${d.rating} · ${d.ratingRankLabel} (${(d.ratingSource ?? '').toLowerCase()})`;
  if (d.ratingRankLabel) return d.ratingRankLabel;
  if (d.rating != null)
    return `${d.rating}${d.reviewCount ? ` · ${d.reviewCount.toLocaleString()} reviews` : ''}${
      d.ratingSource ? ` (${String(d.ratingSource).toLowerCase()})` : ''
    }`;
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
            “{d.reviewQuote}” <span className="not-italic">— {d.reviewQuoteAuthor ?? 'reviewer'}</span>
          </span>,
        );
      push('Location', [d.neighbourhood, d.address].filter(Boolean).join(' · ') || null);
      push('Price', section === 'hotels' ? money(d.pricePerNightFrom, d.currency) && `from ${money(d.pricePerNightFrom, d.currency)} / night` : d.priceRange && String(d.priceRange).toLowerCase());
      push(section === 'hotels' ? 'Class' : 'Cuisine', section === 'hotels' ? (d.starRating ? `${d.starRating}-star` : null) : list(d.cuisines));
      push(section === 'hotels' ? 'Amenities' : 'Signature dishes', list(section === 'hotels' ? d.amenities : d.signatureDishes));
      if (section === 'hotels') push('Check-in / out', d.checkInTime ? `${d.checkInTime} / ${d.checkOutTime ?? '—'}` : null);
      if (section === 'restaurants') {
        push('Hours', hoursTable(d.hoursOfOperation));
        push('Opened', d.openedYear);
      }
      push('Phone', d.phone);
      push('Map', link(d.mapUrl, 'View on map'));
      push(section === 'hotels' ? 'Book' : 'Reserve', link(d.bookingUrl ?? d.reservationUrl));
      push('Menu', link(d.menuUrl));
      break;

    case 'events':
      push('When', d.startDateTime ? `${formatDate(d.startDateTime, 'EEE d MMM, h:mma')}${d.endDateTime && d.endDateTime !== d.startDateTime ? ` – ${formatDate(d.endDateTime, 'd MMM')}` : ''}` : null);
      push('Venue', [d.venueName, d.neighbourhood].filter(Boolean).join(' · ') || null);
      push('Organiser', d.organiser);
      push('Lineup', list(d.lineup));
      push('Price', d.isFree ? 'Free' : d.priceFrom != null ? `${money(d.priceFrom, d.currency)}–${money(d.priceTo, d.currency)}` : d.price);
      push('Age', d.ageRestriction);
      push('Capacity', d.capacity ? d.capacity.toLocaleString() : null);
      push('Tickets', link(d.ticketUrl, d.ticketProvider ? `Get tickets (${d.ticketProvider})` : 'Get tickets'));
      push('Map', link(d.mapUrl, 'View on map'));
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
        (d.spotifyUrl || d.appleMusicUrl || d.youtubeUrl || d.audiomackUrl) && (
          <span className="flex flex-wrap gap-3">
            {link(d.spotifyUrl, 'Spotify')}
            {link(d.appleMusicUrl, 'Apple Music')}
            {link(d.youtubeUrl, 'YouTube')}
            {link(d.audiomackUrl, 'Audiomack')}
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
      push('Watch', link(d.videoUrl, 'Open video'));
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
      push('Contact', [d.phone, d.email].filter(Boolean).join(' · ') || null);
      push('Links', (d.website || d.instagramUrl || d.twitterUrl) && (
        <span className="flex flex-wrap gap-3">
          {link(d.website, 'Website')}
          {link(d.instagramUrl, 'Instagram')}
          {link(d.twitterUrl, 'X')}
        </span>
      ));
      push('Map', link(d.mapUrl, 'View on map'));
      break;

    case 'churches':
      push('Host', d.hostOrSpeaker);
      push('Date', d.eventDate ? formatDate(d.eventDate, 'EEE d MMM, h:mma') : null);
      push('Venue', [d.venueName, d.neighbourhood].filter(Boolean).join(' · ') || null);
      push('Denomination', d.denomination);
      push('Service times', hoursTable(d.serviceTimes));
      push('Guests', list(d.guestSpeakers));
      push('Online', d.isOnline ? link(d.streamUrl, 'Watch the stream') : null);
      push('Register', link(d.registrationUrl));
      push('Contact', d.contactPhone);
      push('Map', link(d.mapUrl, 'View on map'));
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
  }

  return f.filter(Boolean) as Fact[];
}

export function ContentFacts({ item, section }: { item: unknown; section: string }) {
  const facts = build(section, item as any);
  if (facts.length === 0) return null;

  return (
    <dl className="mt-8 grid gap-x-8 gap-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-5 sm:grid-cols-[10rem_1fr]">
      {facts.map((f, i) => (
        <div key={i} className="contents">
          <dt className="text-sm font-semibold text-gray-500 sm:pt-0.5">{f.label}</dt>
          <dd className="text-[15px] text-gray-800">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
