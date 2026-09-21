/**
 * Per-category field config for the public contributor detail form
 * (`/contribute/[token]`). Mirrors the CMS's own `lib/cms/content-schema.ts`
 * field-for-field — the two repos don't share code, so this is a deliberate,
 * hand-kept-in-sync copy, trimmed to what a public form needs (no `span`
 * grid layout, no CMS-only help copy). Update both when a content type's
 * fields change.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'int'
  | 'number'
  | 'url'
  | 'mediaUrl'
  | 'datetime'
  | 'date'
  | 'boolean'
  | 'enum'
  | 'stringList'
  | 'keyValue'
  | 'duration';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CategoryConfig {
  label: string;
  fields: FieldDef[];
}

const RATING_SOURCE = [
  { value: 'GOOGLE', label: 'Google' },
  { value: 'TRIPADVISOR', label: 'Tripadvisor' },
  { value: 'HOTELS_NG', label: 'Hotels.ng' },
  { value: 'JUMIA_TRAVEL', label: 'Jumia Travel' },
  { value: 'BOOKING_COM', label: 'Booking.com' },
  { value: 'EXPEDIA', label: 'Expedia' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'EDITORIAL', label: 'Editorial' },
];
const PRICE_RANGE = [
  { value: 'BUDGET', label: '₦ Budget' },
  { value: 'MODERATE', label: '₦₦ Moderate' },
  { value: 'UPSCALE', label: '₦₦₦ Upscale' },
  { value: 'LUXURY', label: '₦₦₦₦ Luxury' },
];

const placeLocation: FieldDef[] = [
  { key: 'address', label: 'Address', kind: 'text', required: true, hint: 'Full street address' },
  { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', placeholder: 'Victoria Island', required: true },
  { key: 'phone', label: 'Phone', kind: 'text', required: true },
  { key: 'mapUrl', label: 'Map link', kind: 'url' },
];
const ratingFields: FieldDef[] = [
  { key: 'rating', label: 'Rating (0–5)', kind: 'number' },
  { key: 'reviewCount', label: 'Review count', kind: 'int' },
  { key: 'ratingSource', label: 'Rating source', kind: 'enum', options: RATING_SOURCE },
  { key: 'ratingRankLabel', label: 'Rank label', kind: 'text', placeholder: '#6 of 182 in Lagos' },
  { key: 'reviewQuote', label: 'Review quote', kind: 'textarea' },
  { key: 'reviewQuoteAuthor', label: 'Quote attributed to', kind: 'text', placeholder: 'Tripadvisor reviewer' },
];

/** Keyed by `ContentType` enum value — matches the CMS's `CONTENT_PATHS` keys. */
export const CATEGORY_FIELDS: Record<string, CategoryConfig> = {
  READ: {
    label: 'Read',
    fields: [
      { key: 'author', label: 'Author', kind: 'text' },
      { key: 'authorTitle', label: 'Author title', kind: 'text', placeholder: 'Staff writer' },
      { key: 'readingTimeMinutes', label: 'Reading time (min)', kind: 'int' },
      { key: 'keyTakeaways', label: 'Key takeaways', kind: 'stringList', hint: 'Bullet summary shown on the article' },
      { key: 'sources', label: 'Sources', kind: 'stringList' },
    ],
  },
  HOTEL: {
    label: 'Hotel',
    fields: [
      ...ratingFields,
      { key: 'starRating', label: 'Star rating (1–5)', kind: 'int' },
      ...placeLocation,
      { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE, required: true },
      { key: 'pricePerNightFrom', label: 'From / night', kind: 'int' },
      { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
      { key: 'checkInTime', label: 'Check-in', kind: 'text', placeholder: '3:00 PM' },
      { key: 'checkOutTime', label: 'Check-out', kind: 'text', placeholder: '11:00 AM' },
      { key: 'amenities', label: 'Amenities', kind: 'stringList' },
      { key: 'bookingUrl', label: 'Booking link', kind: 'url' },
    ],
  },
  RESTAURANT: {
    label: 'Restaurant',
    fields: [
      ...ratingFields,
      ...placeLocation,
      { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE, required: true },
      { key: 'openedYear', label: 'Opened (year)', kind: 'int' },
      { key: 'cuisines', label: 'Cuisines', kind: 'stringList', required: true },
      { key: 'signatureDishes', label: 'Signature dishes', kind: 'stringList' },
      { key: 'hoursOfOperation', label: 'Opening hours', kind: 'keyValue', hint: 'e.g. mon → 9:00–22:00' },
      { key: 'reservationUrl', label: 'Reservation link', kind: 'url' },
      { key: 'menuUrl', label: 'Menu link', kind: 'url' },
    ],
  },
  EVENT: {
    label: 'Event',
    fields: [
      { key: 'startDateTime', label: 'Starts', kind: 'datetime', required: true },
      { key: 'endDateTime', label: 'Ends', kind: 'datetime' },
      { key: 'venueName', label: 'Venue', kind: 'text', required: true },
      { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true },
      { key: 'address', label: 'Address', kind: 'text', required: true },
      { key: 'mapUrl', label: 'Map link', kind: 'url' },
      { key: 'organiser', label: 'Organiser', kind: 'text' },
      { key: 'capacity', label: 'Capacity', kind: 'int' },
      { key: 'ageRestriction', label: 'Age restriction', kind: 'text', placeholder: '18+' },
      { key: 'lineup', label: 'Lineup', kind: 'stringList' },
      { key: 'isFree', label: 'Free entry', kind: 'boolean' },
      { key: 'priceFrom', label: 'Price from', kind: 'int' },
      { key: 'priceTo', label: 'Price to', kind: 'int' },
      { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
      { key: 'ticketProvider', label: 'Ticket provider', kind: 'text', placeholder: 'Eventbrite' },
      { key: 'ticketUrl', label: 'Ticket link', kind: 'url' },
    ],
  },
  SONG: {
    label: 'Song / Album',
    fields: [
      { key: 'artist', label: 'Artist', kind: 'text', required: true },
      { key: 'featuredArtists', label: 'Featured artists', kind: 'stringList' },
      { key: 'releaseDate', label: 'Release date', kind: 'date' },
      { key: 'isAlbum', label: 'Is an album', kind: 'boolean' },
      { key: 'trackCount', label: 'Track count', kind: 'int' },
      { key: 'durationSeconds', label: 'Duration', kind: 'duration', placeholder: '3:45' },
      { key: 'genre', label: 'Genre', kind: 'stringList', required: true },
      { key: 'label', label: 'Label', kind: 'text' },
      { key: 'producer', label: 'Producer', kind: 'text' },
      { key: 'spotifyUrl', label: 'Spotify', kind: 'url' },
      { key: 'appleMusicUrl', label: 'Apple Music', kind: 'url' },
      { key: 'youtubeMusicUrl', label: 'YouTube Music', kind: 'url' },
      { key: 'audiomackUrl', label: 'Audiomack', kind: 'url' },
    ],
  },
  VIDEO: {
    label: 'Video',
    fields: [
      { key: 'videoUrl', label: 'Video link', kind: 'url', required: true, hint: 'YouTube / Vimeo link' },
      { key: 'creatorName', label: 'Creator', kind: 'text', required: true },
      { key: 'channelUrl', label: 'Channel URL', kind: 'url' },
      { key: 'durationSeconds', label: 'Duration', kind: 'duration', placeholder: '3:45' },
      { key: 'series', label: 'Series', kind: 'text' },
      { key: 'topics', label: 'Topics', kind: 'stringList', required: true },
    ],
  },
  STARTUP: {
    label: 'Startup',
    fields: [
      { key: 'tagline', label: 'Tagline', kind: 'text', required: true },
      { key: 'sector', label: 'Sector', kind: 'stringList', required: true },
      { key: 'stage', label: 'Stage', kind: 'text', placeholder: 'Seed / Series A', required: true },
      {
        key: 'startupStatus',
        label: 'Status',
        kind: 'enum',
        required: true,
        options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'ACQUIRED', label: 'Acquired' },
          { value: 'SHUT_DOWN', label: 'Shut down' },
        ],
      },
      { key: 'ycBatch', label: 'YC batch', kind: 'text', placeholder: 'W24' },
      { key: 'foundedYear', label: 'Founded (year)', kind: 'int', required: true, placeholder: '2024' },
      { key: 'hqCity', label: 'HQ city', kind: 'text' },
      { key: 'teamSize', label: 'Team size', kind: 'text', placeholder: '11–50' },
      { key: 'fundingRaised', label: 'Funding raised', kind: 'text', placeholder: '$2M seed' },
      { key: 'foundersNames', label: 'Founders', kind: 'stringList' },
      { key: 'website', label: 'Website', kind: 'url', required: true },
      { key: 'linkedinUrl', label: 'LinkedIn', kind: 'url' },
      { key: 'twitterUrl', label: 'X / Twitter', kind: 'url' },
    ],
  },
  BUSINESS: {
    label: 'New business',
    fields: [
      { key: 'tagline', label: 'Tagline', kind: 'text', required: true },
      { key: 'sector', label: 'Sector', kind: 'stringList' },
      { key: 'industry', label: 'Industry', kind: 'text' },
      { key: 'foundedYear', label: 'Founded (year)', kind: 'int', placeholder: '2024' },
      { key: 'hqCity', label: 'HQ city', kind: 'text' },
      { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true },
      { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE },
      { key: 'phone', label: 'Phone', kind: 'text', required: true },
      { key: 'email', label: 'Email', kind: 'text' },
      { key: 'mapUrl', label: 'Map link', kind: 'url' },
      { key: 'website', label: 'Website', kind: 'url' },
      { key: 'instagramUrl', label: 'Instagram', kind: 'url' },
      { key: 'twitterUrl', label: 'X / Twitter', kind: 'url' },
    ],
  },
  CHURCH: {
    label: 'Faith event',
    fields: [
      { key: 'hostOrSpeaker', label: 'Host / speaker', kind: 'text', required: true },
      { key: 'eventDate', label: 'Event date', kind: 'datetime', required: true },
      { key: 'denomination', label: 'Denomination', kind: 'text' },
      { key: 'venueName', label: 'Venue', kind: 'text', required: true },
      { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true },
      { key: 'address', label: 'Address', kind: 'text', required: true },
      { key: 'mapUrl', label: 'Map link', kind: 'url' },
      { key: 'guestSpeakers', label: 'Guest speakers', kind: 'stringList' },
      { key: 'serviceTimes', label: 'Service times', kind: 'keyValue' },
      { key: 'isOnline', label: 'Streamed online', kind: 'boolean' },
      { key: 'streamUrl', label: 'Stream URL', kind: 'url' },
      { key: 'registrationUrl', label: 'Registration URL', kind: 'url' },
      { key: 'contactPhone', label: 'Contact phone', kind: 'text' },
    ],
  },
  OPPORTUNITY: {
    label: 'Opportunity',
    fields: [
      {
        key: 'opportunityType',
        label: 'Type',
        kind: 'enum',
        required: true,
        options: [
          { value: 'JOB', label: 'Job' },
          { value: 'GRANT', label: 'Grant' },
          { value: 'FELLOWSHIP', label: 'Fellowship' },
          { value: 'INTERNSHIP', label: 'Internship' },
          { value: 'SCHOLARSHIP', label: 'Scholarship' },
        ],
      },
      { key: 'organiser', label: 'Organiser', kind: 'text', required: true },
      { key: 'deadline', label: 'Deadline', kind: 'date', required: true },
      { key: 'startDate', label: 'Start date', kind: 'date' },
      { key: 'compensation', label: 'Compensation', kind: 'text', placeholder: '₦400k / month' },
      { key: 'locationType', label: 'Location type', kind: 'text', placeholder: 'Remote / Hybrid / On-site' },
      { key: 'isRemote', label: 'Remote', kind: 'boolean' },
      { key: 'duration', label: 'Duration', kind: 'text', placeholder: '6 months' },
      { key: 'experienceLevel', label: 'Experience level', kind: 'text' },
      { key: 'fields', label: 'Fields', kind: 'stringList' },
      { key: 'benefits', label: 'Benefits', kind: 'stringList' },
      { key: 'eligibility', label: 'Eligibility', kind: 'textarea' },
      { key: 'applyUrl', label: 'Apply URL', kind: 'url', required: true },
    ],
  },
  FILM: {
    label: 'Film',
    fields: [
      { key: 'director', label: 'Director', kind: 'text' },
      { key: 'cast', label: 'Cast', kind: 'stringList' },
      { key: 'genre', label: 'Genre', kind: 'stringList', required: true },
      { key: 'runtimeMinutes', label: 'Runtime (min)', kind: 'int' },
      {
        key: 'releaseType',
        label: 'Release type',
        kind: 'enum',
        required: true,
        options: [
          { value: 'CINEMA', label: 'Cinema' },
          { value: 'STREAMING', label: 'Streaming' },
          { value: 'BOTH', label: 'Cinema + Streaming' },
        ],
      },
      { key: 'releaseDate', label: 'Release date', kind: 'date' },
      { key: 'streamingPlatform', label: 'Streaming platform', kind: 'text', placeholder: 'Netflix' },
      { key: 'cinemaChains', label: 'Cinema chains', kind: 'stringList', placeholder: 'Filmhouse' },
      { key: 'ageRating', label: 'Age rating', kind: 'text', placeholder: '18+' },
      { key: 'productionCompany', label: 'Production company', kind: 'text' },
      { key: 'trailerUrl', label: 'Trailer link', kind: 'url', hint: 'YouTube / Vimeo trailer link' },
      { key: 'ticketUrl', label: 'Ticket link', kind: 'url' },
    ],
  },
  AIRLINE: {
    label: 'Airline',
    fields: [
      { key: 'routeFrom', label: 'From', kind: 'text', required: true },
      { key: 'routeTo', label: 'To', kind: 'text', required: true },
      { key: 'launchDate', label: 'Launch date', kind: 'date' },
      { key: 'hubAirport', label: 'Hub airport', kind: 'text' },
      { key: 'fleetType', label: 'Fleet type', kind: 'text', placeholder: 'Boeing 737' },
      { key: 'frequency', label: 'Frequency', kind: 'text', placeholder: 'Daily' },
      { key: 'fareFrom', label: 'Fare from', kind: 'int' },
      { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
      { key: 'bookingUrl', label: 'Booking link', kind: 'url', required: true },
      { key: 'airlineWebsite', label: 'Airline website', kind: 'url' },
    ],
  },
  REAL_ESTATE: {
    label: 'Real estate',
    fields: [
      { key: 'developer', label: 'Developer', kind: 'text', required: true },
      {
        key: 'propertyType',
        label: 'Property type',
        kind: 'enum',
        required: true,
        options: [
          { value: 'RESIDENTIAL', label: 'Residential' },
          { value: 'COMMERCIAL', label: 'Commercial' },
          { value: 'MIXED_USE', label: 'Mixed use' },
        ],
      },
      { key: 'unitTypes', label: 'Unit types', kind: 'stringList', placeholder: '2-bed' },
      { key: 'priceFrom', label: 'Price from', kind: 'int' },
      { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
      { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true },
      { key: 'address', label: 'Address', kind: 'text' },
      { key: 'mapUrl', label: 'Map link', kind: 'url' },
      { key: 'completionDate', label: 'Completion date', kind: 'date' },
      { key: 'paymentPlan', label: 'Payment plan', kind: 'text', placeholder: 'Off-plan, 24-month plan' },
      { key: 'amenities', label: 'Amenities', kind: 'stringList' },
      { key: 'salesPhone', label: 'Sales phone', kind: 'text' },
      { key: 'brochureUrl', label: 'Brochure link', kind: 'url' },
    ],
  },
  PODCAST: {
    label: 'Podcast',
    fields: [
      { key: 'showName', label: 'Show name', kind: 'text', required: true },
      { key: 'episodeTitle', label: 'Episode title', kind: 'text' },
      { key: 'hosts', label: 'Hosts', kind: 'stringList', required: true },
      { key: 'topics', label: 'Topics', kind: 'stringList' },
      { key: 'durationSeconds', label: 'Episode length', kind: 'duration', placeholder: '45:00' },
      { key: 'spotifyUrl', label: 'Spotify', kind: 'url' },
      { key: 'applePodcastsUrl', label: 'Apple Podcasts', kind: 'url' },
      { key: 'youtubeUrl', label: 'YouTube', kind: 'url' },
    ],
  },
  VENUE: {
    label: 'Venue',
    fields: [
      {
        key: 'venueType',
        label: 'Venue type',
        kind: 'enum',
        required: true,
        options: [
          { value: 'EVENT_SPACE', label: 'Event space' },
          { value: 'CLUB', label: 'Club' },
          { value: 'GALLERY', label: 'Gallery' },
          { value: 'COWORKING', label: 'Coworking' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      { key: 'capacity', label: 'Capacity', kind: 'int' },
      { key: 'address', label: 'Address', kind: 'text', required: true },
      { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true },
      { key: 'mapUrl', label: 'Map link', kind: 'url' },
      { key: 'amenities', label: 'Amenities', kind: 'stringList' },
      { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE },
      { key: 'openingHours', label: 'Opening hours', kind: 'keyValue', hint: 'e.g. mon → 9:00–22:00' },
      { key: 'bookingUrl', label: 'Booking link', kind: 'url' },
      { key: 'contactPhone', label: 'Contact phone', kind: 'text' },
    ],
  },
  EDUCATION: {
    label: 'Education',
    fields: [
      { key: 'institution', label: 'Institution', kind: 'text', required: true },
      {
        key: 'programType',
        label: 'Program type',
        kind: 'enum',
        required: true,
        options: [
          { value: 'DEGREE', label: 'Degree' },
          { value: 'BOOTCAMP', label: 'Bootcamp' },
          { value: 'CERTIFICATE', label: 'Certificate' },
          { value: 'WORKSHOP', label: 'Workshop' },
        ],
      },
      { key: 'duration', label: 'Duration', kind: 'text', placeholder: '6 months' },
      { key: 'tuition', label: 'Tuition', kind: 'int' },
      { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
      { key: 'deliveryMode', label: 'Delivery mode', kind: 'text', placeholder: 'Online / In-person / Hybrid' },
      { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text' },
      { key: 'applicationDeadline', label: 'Application deadline', kind: 'date' },
      { key: 'startDate', label: 'Start date', kind: 'date' },
      { key: 'eligibility', label: 'Eligibility', kind: 'textarea' },
      { key: 'applyUrl', label: 'Apply URL', kind: 'url', required: true },
    ],
  },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_FIELDS).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));
