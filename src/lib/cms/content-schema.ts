/**
 * Per-content-type field config that drives the CMS editor form. Base fields
 * (title, slug, excerpt, body, cover, tags, cities, SEO, publish) are handled by
 * <ContentForm> directly — this only describes the type-specific detail fields.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'int'
  | 'number'
  | 'url'
  | 'datetime'
  | 'date'
  | 'boolean'
  | 'enum'
  | 'stringList'
  | 'keyValue';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** grid span on desktop */
  span?: 1 | 2;
}

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

export interface TypeConfig {
  /** URL path segment / API resource */
  path: string;
  /** singular display name */
  label: string;
  groups: FieldGroup[];
}

const RATING_SOURCE = [
  { value: 'GOOGLE', label: 'Google' },
  { value: 'TRIPADVISOR', label: 'Tripadvisor' },
  { value: 'EDITORIAL', label: 'Editorial' },
];
const PRICE_RANGE = [
  { value: 'BUDGET', label: '₦ Budget' },
  { value: 'MODERATE', label: '₦₦ Moderate' },
  { value: 'UPSCALE', label: '₦₦₦ Upscale' },
  { value: 'LUXURY', label: '₦₦₦₦ Luxury' },
];

const placeLocation: FieldDef[] = [
  { key: 'address', label: 'Address', kind: 'text', span: 2 },
  { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', placeholder: 'Victoria Island' },
  { key: 'phone', label: 'Phone', kind: 'text' },
  { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2 },
];
const ratingFields: FieldDef[] = [
  { key: 'rating', label: 'Rating (0–5)', kind: 'number' },
  { key: 'reviewCount', label: 'Review count', kind: 'int' },
  { key: 'ratingSource', label: 'Rating source', kind: 'enum', options: RATING_SOURCE },
  { key: 'ratingRankLabel', label: 'Rank label', kind: 'text', placeholder: '#6 of 182 in Lagos', span: 2 },
  { key: 'reviewQuote', label: 'Review quote', kind: 'textarea', span: 2 },
  { key: 'reviewQuoteAuthor', label: 'Quote attributed to', kind: 'text', placeholder: 'Tripadvisor reviewer' },
];

export const CONTENT_TYPES: Record<string, TypeConfig> = {
  reads: {
    path: 'reads',
    label: 'Read',
    groups: [
      {
        title: 'Editorial',
        fields: [
          { key: 'author', label: 'Author', kind: 'text' },
          { key: 'authorTitle', label: 'Author title', kind: 'text', placeholder: 'Staff writer' },
          { key: 'readingTimeMinutes', label: 'Reading time (min)', kind: 'int' },
          { key: 'updatedNote', label: 'Updated note', kind: 'text', span: 2, placeholder: 'Updated 12 Sep with…' },
          { key: 'keyTakeaways', label: 'Key takeaways', kind: 'stringList', span: 2, help: 'Bullet summary shown on the article.' },
          { key: 'sources', label: 'Sources', kind: 'stringList', span: 2 },
        ],
      },
    ],
  },
  hotels: {
    path: 'hotels',
    label: 'Hotel',
    groups: [
      { title: 'Rating & reviews', fields: [...ratingFields, { key: 'starRating', label: 'Star rating (1–5)', kind: 'int' }] },
      { title: 'Location', fields: placeLocation },
      {
        title: 'Pricing & stay',
        fields: [
          { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE },
          { key: 'pricePerNightFrom', label: 'From / night', kind: 'int' },
          { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
          { key: 'checkInTime', label: 'Check-in', kind: 'text', placeholder: '3:00 PM' },
          { key: 'checkOutTime', label: 'Check-out', kind: 'text', placeholder: '11:00 AM' },
          { key: 'amenities', label: 'Amenities', kind: 'stringList', span: 2 },
          { key: 'bookingUrl', label: 'Booking link', kind: 'url', span: 2 },
        ],
      },
    ],
  },
  restaurants: {
    path: 'restaurants',
    label: 'Restaurant',
    groups: [
      { title: 'Rating & reviews', fields: ratingFields },
      { title: 'Location', fields: placeLocation },
      {
        title: 'The place',
        fields: [
          { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE },
          { key: 'openedYear', label: 'Opened (year)', kind: 'int' },
          { key: 'cuisines', label: 'Cuisines', kind: 'stringList', span: 2 },
          { key: 'signatureDishes', label: 'Signature dishes', kind: 'stringList', span: 2 },
          { key: 'hoursOfOperation', label: 'Opening hours', kind: 'keyValue', span: 2, help: 'e.g. mon → 9:00–22:00' },
          { key: 'reservationUrl', label: 'Reservation link', kind: 'url' },
          { key: 'menuUrl', label: 'Menu link', kind: 'url' },
        ],
      },
    ],
  },
  events: {
    path: 'events',
    label: 'Event',
    groups: [
      {
        title: 'When & where',
        fields: [
          { key: 'startDateTime', label: 'Starts', kind: 'datetime', required: true },
          { key: 'endDateTime', label: 'Ends', kind: 'datetime' },
          { key: 'venueName', label: 'Venue', kind: 'text' },
          { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text' },
          { key: 'address', label: 'Address', kind: 'text', span: 2 },
          { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2 },
          { key: 'organiser', label: 'Organiser', kind: 'text' },
          { key: 'capacity', label: 'Capacity', kind: 'int' },
          { key: 'ageRestriction', label: 'Age restriction', kind: 'text', placeholder: '18+' },
          { key: 'lineup', label: 'Lineup', kind: 'stringList', span: 2 },
        ],
      },
      {
        title: 'Tickets',
        fields: [
          { key: 'isFree', label: 'Free entry', kind: 'boolean' },
          { key: 'price', label: 'Price (text)', kind: 'text', placeholder: '₦10,000 – ₦25,000' },
          { key: 'priceFrom', label: 'Price from', kind: 'int' },
          { key: 'priceTo', label: 'Price to', kind: 'int' },
          { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN' },
          { key: 'ticketProvider', label: 'Ticket provider', kind: 'text', placeholder: 'Eventbrite' },
          { key: 'ticketUrl', label: 'Ticket link', kind: 'url', span: 2 },
        ],
      },
    ],
  },
  songs: {
    path: 'songs',
    label: 'Song / Album',
    groups: [
      {
        title: 'Release',
        fields: [
          { key: 'artist', label: 'Artist', kind: 'text', required: true },
          { key: 'featuredArtists', label: 'Featured artists', kind: 'stringList', span: 2 },
          { key: 'releaseDate', label: 'Release date', kind: 'date' },
          { key: 'isAlbum', label: 'Is an album', kind: 'boolean' },
          { key: 'trackCount', label: 'Track count', kind: 'int' },
          { key: 'durationSeconds', label: 'Duration (sec)', kind: 'int' },
          { key: 'genre', label: 'Genre', kind: 'stringList', span: 2 },
          { key: 'label', label: 'Label', kind: 'text' },
          { key: 'producer', label: 'Producer', kind: 'text' },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'spotifyUrl', label: 'Spotify', kind: 'url' },
          { key: 'appleMusicUrl', label: 'Apple Music', kind: 'url' },
          { key: 'youtubeUrl', label: 'YouTube', kind: 'url' },
          { key: 'audiomackUrl', label: 'Audiomack', kind: 'url' },
          { key: 'previewAudioUrl', label: 'Preview audio', kind: 'url' },
          { key: 'spotifyId', label: 'Spotify ID', kind: 'text' },
        ],
      },
    ],
  },
  videos: {
    path: 'videos',
    label: 'Video',
    groups: [
      {
        title: 'Video',
        fields: [
          { key: 'videoUrl', label: 'Video URL', kind: 'url', required: true, span: 2 },
          { key: 'platform', label: 'Platform', kind: 'enum', options: [{ value: 'YOUTUBE', label: 'YouTube' }, { value: 'OTHER', label: 'Other' }] },
          { key: 'videoId', label: 'Video ID', kind: 'text' },
          { key: 'creatorName', label: 'Creator', kind: 'text' },
          { key: 'channelUrl', label: 'Channel URL', kind: 'url' },
          { key: 'durationSeconds', label: 'Duration (sec)', kind: 'int' },
          { key: 'series', label: 'Series', kind: 'text' },
          { key: 'externalViews', label: 'View count (platform)', kind: 'int' },
          { key: 'externalPublishedAt', label: 'Published on platform', kind: 'datetime' },
          { key: 'topics', label: 'Topics', kind: 'stringList', span: 2 },
        ],
      },
    ],
  },
  startups: {
    path: 'startups',
    label: 'Startup',
    groups: [
      {
        title: 'Company',
        fields: [
          { key: 'tagline', label: 'Tagline', kind: 'text', span: 2 },
          { key: 'sector', label: 'Sector', kind: 'stringList', span: 2 },
          { key: 'stage', label: 'Stage', kind: 'text', placeholder: 'Seed / Series A' },
          { key: 'startupStatus', label: 'Status', kind: 'enum', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'ACQUIRED', label: 'Acquired' }, { value: 'SHUT_DOWN', label: 'Shut down' }] },
          { key: 'ycBatch', label: 'YC batch', kind: 'text', placeholder: 'W24' },
          { key: 'foundedYear', label: 'Founded (year)', kind: 'int' },
          { key: 'hqCity', label: 'HQ city', kind: 'text' },
          { key: 'teamSize', label: 'Team size', kind: 'text', placeholder: '11–50' },
          { key: 'fundingRaised', label: 'Funding raised', kind: 'text', placeholder: '$2M seed' },
          { key: 'foundersNames', label: 'Founders', kind: 'stringList', span: 2 },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'website', label: 'Website', kind: 'url' },
          { key: 'linkedinUrl', label: 'LinkedIn', kind: 'url' },
          { key: 'twitterUrl', label: 'X / Twitter', kind: 'url' },
        ],
      },
    ],
  },
  businesses: {
    path: 'businesses',
    label: 'Business',
    groups: [
      {
        title: 'Business',
        fields: [
          { key: 'tagline', label: 'Tagline', kind: 'text', span: 2 },
          { key: 'sector', label: 'Sector', kind: 'stringList', span: 2 },
          { key: 'industry', label: 'Industry', kind: 'text' },
          { key: 'foundedYear', label: 'Founded (year)', kind: 'int' },
          { key: 'hqCity', label: 'HQ city', kind: 'text' },
          { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text' },
          { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE },
          { key: 'phone', label: 'Phone', kind: 'text' },
          { key: 'email', label: 'Email', kind: 'text' },
          { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2 },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'website', label: 'Website', kind: 'url' },
          { key: 'instagramUrl', label: 'Instagram', kind: 'url' },
          { key: 'twitterUrl', label: 'X / Twitter', kind: 'url' },
        ],
      },
    ],
  },
  churches: {
    path: 'churches',
    label: 'Faith event',
    groups: [
      {
        title: 'Event',
        fields: [
          { key: 'hostOrSpeaker', label: 'Host / speaker', kind: 'text' },
          { key: 'eventDate', label: 'Event date', kind: 'datetime' },
          { key: 'denomination', label: 'Denomination', kind: 'text' },
          { key: 'venueName', label: 'Venue', kind: 'text' },
          { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text' },
          { key: 'address', label: 'Address', kind: 'text', span: 2 },
          { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2 },
          { key: 'guestSpeakers', label: 'Guest speakers', kind: 'stringList', span: 2 },
          { key: 'serviceTimes', label: 'Service times', kind: 'keyValue', span: 2 },
        ],
      },
      {
        title: 'Attend',
        fields: [
          { key: 'isOnline', label: 'Streamed online', kind: 'boolean' },
          { key: 'streamUrl', label: 'Stream URL', kind: 'url' },
          { key: 'registrationUrl', label: 'Registration URL', kind: 'url' },
          { key: 'contactPhone', label: 'Contact phone', kind: 'text' },
        ],
      },
    ],
  },
  opportunities: {
    path: 'opportunities',
    label: 'Opportunity',
    groups: [
      {
        title: 'Opportunity',
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
          { key: 'organiser', label: 'Organiser', kind: 'text' },
          { key: 'deadline', label: 'Deadline', kind: 'date' },
          { key: 'startDate', label: 'Start date', kind: 'date' },
          { key: 'compensation', label: 'Compensation', kind: 'text', placeholder: '₦400k / month' },
          { key: 'locationType', label: 'Location type', kind: 'text', placeholder: 'Remote / Hybrid / On-site' },
          { key: 'isRemote', label: 'Remote', kind: 'boolean' },
          { key: 'duration', label: 'Duration', kind: 'text', placeholder: '6 months' },
          { key: 'experienceLevel', label: 'Experience level', kind: 'text' },
          { key: 'fields', label: 'Fields', kind: 'stringList', span: 2 },
          { key: 'benefits', label: 'Benefits', kind: 'stringList', span: 2 },
          { key: 'eligibility', label: 'Eligibility', kind: 'textarea', span: 2 },
          { key: 'applyUrl', label: 'Apply URL', kind: 'url', span: 2 },
        ],
      },
    ],
  },
};

export const CONTENT_TYPE_KEYS = Object.keys(CONTENT_TYPES);
