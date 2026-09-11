/**
 * Per-content-type field config that drives the CMS editor form. Base fields
 * (title, slug, excerpt, body, cover, tags, cities, SEO, publish) are handled by
 * <ContentForm> directly - this only describes the type-specific detail fields.
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
  help?: string;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** for kind 'mediaUrl': which media type the upload/library picker accepts */
  accept?: 'audio' | 'video';
  /** grid span on desktop */
  span?: 1 | 2;
  /** for kind 'date'/'datetime': this is a forward-looking date (event start, deadline)
   *  so past values should be blocked in the picker. Leave unset for historical dates
   *  (release date, published-on-platform date). */
  blockPast?: boolean;
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
  { key: 'address', label: 'Address', kind: 'text', span: 2, required: true, tooltip: 'Full street address of the location' },
  { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', placeholder: 'Victoria Island', required: true, tooltip: 'Area or district where this place is located' },
  { key: 'phone', label: 'Phone', kind: 'text', required: true, tooltip: 'Contact number for inquiries and reservations' },
  { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2, tooltip: 'Google Maps or other map service link to the exact location' },
];
const ratingFields: FieldDef[] = [
  { key: 'rating', label: 'Rating (0–5)', kind: 'number', tooltip: 'Average rating score from reviews (0 to 5 stars)' },
  { key: 'reviewCount', label: 'Review count', kind: 'int', tooltip: 'Total number of reviews received' },
  { key: 'ratingSource', label: 'Rating source', kind: 'enum', options: RATING_SOURCE, tooltip: 'Platform where the rating came from (Google, Tripadvisor, or Editorial)' },
  { key: 'ratingRankLabel', label: 'Rank label', kind: 'text', placeholder: '#6 of 182 in Lagos', span: 2, tooltip: 'Ranking text from review platform (e.g., "#6 of 182 hotels in Lagos")' },
  { key: 'reviewQuote', label: 'Review quote', kind: 'textarea', span: 2, tooltip: 'A standout review quote to highlight' },
  { key: 'reviewQuoteAuthor', label: 'Quote attributed to', kind: 'text', placeholder: 'Tripadvisor reviewer', tooltip: 'Who said the review quote (e.g., reviewer name or platform)' },
];

export const CONTENT_TYPES: Record<string, TypeConfig> = {
  reads: {
    path: 'reads',
    label: 'Read',
    groups: [
      {
        title: 'Editorial',
        fields: [
          { 
            key: 'author', 
            label: 'Author', 
            kind: 'text',
            tooltip: 'Name of the person who wrote this article'
          },
          { 
            key: 'authorTitle', 
            label: 'Author title', 
            kind: 'text', 
            placeholder: 'Staff writer',
            tooltip: 'Job title or role of the author (e.g., Staff Writer, Editor, Contributor)'
          },
          { 
            key: 'readingTimeMinutes', 
            label: 'Reading time (min)', 
            kind: 'int',
            tooltip: 'Estimated time in minutes for readers to finish this article'
          },
          { 
            key: 'updatedNote', 
            label: 'Updated note', 
            kind: 'text', 
            span: 2, 
            placeholder: 'Updated 12 Sep with…',
            tooltip: 'Optional note explaining what was updated in this article after initial publication'
          },
          { 
            key: 'keyTakeaways', 
            label: 'Key takeaways', 
            kind: 'stringList', 
            span: 2, 
            help: 'Bullet summary shown on the article.',
            tooltip: 'Main points or highlights from the article displayed as a bulleted list'
          },
          { 
            key: 'sources', 
            label: 'Sources', 
            kind: 'stringList', 
            span: 2,
            tooltip: 'List of references, research papers, or people quoted in this article for fact-checking'
          },
        ],
      },
    ],
  },
  hotels: {
    path: 'hotels',
    label: 'Hotel',
    groups: [
      { title: 'Rating & reviews', fields: [...ratingFields, { key: 'starRating', label: 'Star rating (1–5)', kind: 'int', tooltip: 'Official star rating of the hotel (1-5 stars)' }] },
      { title: 'Location', fields: placeLocation },
      {
        title: 'Pricing & stay',
        fields: [
          { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE, required: true, tooltip: 'Budget category to help users filter by price' },
          { key: 'pricePerNightFrom', label: 'From / night', kind: 'int', tooltip: 'Starting price per night in local currency' },
          { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN', tooltip: 'Currency code (e.g., NGN, USD, GBP)' },
          { key: 'checkInTime', label: 'Check-in', kind: 'text', placeholder: '3:00 PM', tooltip: 'Standard check-in time' },
          { key: 'checkOutTime', label: 'Check-out', kind: 'text', placeholder: '11:00 AM', tooltip: 'Standard check-out time' },
          { key: 'amenities', label: 'Amenities', kind: 'stringList', span: 2, tooltip: 'List of facilities (e.g., WiFi, Pool, Gym, Restaurant, Parking)' },
          { key: 'bookingUrl', label: 'Booking link', kind: 'url', span: 2, tooltip: 'Direct link to book this hotel (e.g., hotel website, Booking.com, Hotels.ng)' },
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
          { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE, required: true, tooltip: 'Budget category to help users filter by price' },
          { key: 'openedYear', label: 'Opened (year)', kind: 'int', tooltip: 'Year the restaurant first opened' },
          { key: 'cuisines', label: 'Cuisines', kind: 'stringList', span: 2, required: true, tooltip: 'Types of food served (e.g., Nigerian, Italian, Chinese, Continental, Fusion)' },
          { key: 'signatureDishes', label: 'Signature dishes', kind: 'stringList', span: 2, tooltip: 'Must-try dishes this restaurant is famous for' },
          { key: 'hoursOfOperation', label: 'Opening hours', kind: 'keyValue', span: 2, help: 'e.g. mon → 9:00–22:00', tooltip: 'Weekly schedule showing when the restaurant is open' },
          { key: 'reservationUrl', label: 'Reservation link', kind: 'url', tooltip: 'Link to make reservations (e.g., OpenTable, restaurant website)' },
          { key: 'menuUrl', label: 'Menu link', kind: 'url', tooltip: 'Link to view the full menu online' },
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
          { key: 'startDateTime', label: 'Starts', kind: 'datetime', required: true, blockPast: true, tooltip: 'When the event begins' },
          { key: 'endDateTime', label: 'Ends', kind: 'datetime', blockPast: true, tooltip: 'When the event ends (optional for ongoing events)' },
          { key: 'venueName', label: 'Venue', kind: 'text', required: true, tooltip: 'Name of the venue or location where the event takes place' },
          { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true, tooltip: 'Area or district (e.g., Victoria Island, Lekki, Ikeja)' },
          { key: 'address', label: 'Address', kind: 'text', span: 2, required: true, tooltip: 'Full street address of the venue' },
          { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2, tooltip: 'Google Maps or other map service link to the venue' },
          { key: 'organiser', label: 'Organiser', kind: 'text', tooltip: 'Person or organization hosting the event' },
          { key: 'capacity', label: 'Capacity', kind: 'int', tooltip: 'Maximum number of attendees' },
          { key: 'ageRestriction', label: 'Age restriction', kind: 'text', placeholder: '18+', tooltip: 'Minimum age requirement (e.g., 18+, 21+, All ages)' },
          { key: 'lineup', label: 'Lineup', kind: 'stringList', span: 2, tooltip: 'List of performers, speakers, or artists appearing' },
        ],
      },
      {
        title: 'Tickets',
        fields: [
          { key: 'isFree', label: 'Free entry', kind: 'boolean', tooltip: 'Toggle if this is a free event' },
          { key: 'priceFrom', label: 'Price from', kind: 'int', tooltip: 'Minimum ticket price (used for filtering and display)' },
          { key: 'priceTo', label: 'Price to', kind: 'int', tooltip: 'Maximum ticket price (leave empty if single price)' },
          { key: 'currency', label: 'Currency', kind: 'text', placeholder: 'NGN', tooltip: 'Currency code (e.g., NGN, USD, GBP)' },
          { key: 'ticketProvider', label: 'Ticket provider', kind: 'text', placeholder: 'Eventbrite', tooltip: 'Platform selling tickets (e.g., Eventbrite, Nairabox, Tix.Africa)' },
          { key: 'ticketUrl', label: 'Ticket link', kind: 'url', span: 2, tooltip: 'Direct link to purchase tickets' },
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
          { key: 'artist', label: 'Artist', kind: 'text', required: true, tooltip: 'Main artist or band name' },
          { key: 'featuredArtists', label: 'Featured artists', kind: 'stringList', span: 2, tooltip: 'Additional artists featured on this track' },
          { key: 'releaseDate', label: 'Release date', kind: 'date', tooltip: 'Official release date' },
          { key: 'isAlbum', label: 'Is an album', kind: 'boolean', tooltip: 'Toggle if this is a full album (vs single/EP)' },
          { key: 'trackCount', label: 'Track count', kind: 'int', tooltip: 'Number of tracks in the album' },
          { key: 'durationSeconds', label: 'Duration', kind: 'duration', placeholder: '3:45', tooltip: 'Song length in MM:SS format (e.g., 3:45 for 3 minutes 45 seconds)' },
          { key: 'genre', label: 'Genre', kind: 'stringList', span: 2, required: true, tooltip: 'Music genres (e.g., Afrobeats, Hip-hop, Gospel, R&B, Highlife)' },
          { key: 'label', label: 'Label', kind: 'text', tooltip: 'Record label that released this music' },
          { key: 'producer', label: 'Producer', kind: 'text', tooltip: 'Producer(s) who worked on this track' },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'spotifyUrl', label: 'Spotify', kind: 'url', tooltip: 'Link to play on Spotify' },
          { key: 'appleMusicUrl', label: 'Apple Music', kind: 'url', tooltip: 'Link to play on Apple Music' },
          { key: 'youtubeMusicUrl', label: 'YouTube Music', kind: 'url', tooltip: 'Link to play on YouTube Music — also renders as the video player on the song page' },
          { key: 'audiomackUrl', label: 'Audiomack', kind: 'url', tooltip: 'Link to play on Audiomack' },
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
          {
            key: 'videoUrl',
            label: 'Video',
            kind: 'mediaUrl',
            accept: 'video',
            required: true,
            span: 2,
            help: 'Paste a YouTube / Vimeo link, or upload a video file — it plays inline on the page.',
            tooltip: 'The video file or streaming link',
          },
          { key: 'platform', label: 'Platform', kind: 'enum', options: [{ value: 'YOUTUBE', label: 'YouTube' }, { value: 'OTHER', label: 'Other' }], tooltip: 'Where the video is hosted' },
          { key: 'creatorName', label: 'Creator', kind: 'text', required: true, tooltip: 'Name of the person or channel who created this video' },
          { key: 'channelUrl', label: 'Channel URL', kind: 'url', tooltip: 'Link to the creator\'s channel or profile' },
          { key: 'durationSeconds', label: 'Duration', kind: 'duration', placeholder: '3:45', tooltip: 'Video length in MM:SS format (e.g., 3:45 for 3 minutes 45 seconds)' },
          { key: 'series', label: 'Series', kind: 'text', tooltip: 'Series or playlist name if this is part of a collection' },
          { key: 'externalPublishedAt', label: 'Published on platform', kind: 'datetime', tooltip: 'When the video was originally published on the platform' },
          { key: 'topics', label: 'Topics', kind: 'stringList', span: 2, required: true, tooltip: 'Categories or subjects covered (e.g., Tech, Entertainment, Education, Comedy)' },
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
          { key: 'tagline', label: 'Tagline', kind: 'text', span: 2, required: true, tooltip: 'Brief description of what the startup does (shown in cards and listings)' },
          { key: 'sector', label: 'Sector', kind: 'stringList', span: 2, required: true, tooltip: 'Industry categories (e.g., Fintech, E-commerce, Healthtech, SaaS, EdTech)' },
          { key: 'stage', label: 'Stage', kind: 'text', placeholder: 'Seed / Series A', required: true, tooltip: 'Current funding stage (e.g., Pre-seed, Seed, Series A, Series B)' },
          { key: 'startupStatus', label: 'Status', kind: 'enum', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'ACQUIRED', label: 'Acquired' }, { value: 'SHUT_DOWN', label: 'Shut down' }], required: true, tooltip: 'Current operational status of the company' },
          { key: 'ycBatch', label: 'YC batch', kind: 'text', placeholder: 'W24', tooltip: 'Y Combinator batch (if applicable, e.g., W24 for Winter 2024)' },
          { key: 'foundedYear', label: 'Founded (year)', kind: 'int', required: true, placeholder: '2024', tooltip: 'Year the company was founded' },
          { key: 'hqCity', label: 'HQ city', kind: 'text', tooltip: 'City where headquarters is located' },
          { key: 'teamSize', label: 'Team size', kind: 'text', placeholder: '11–50', tooltip: 'Number of employees (can be a range like "11–50" or "50+")' },
          { key: 'fundingRaised', label: 'Funding raised', kind: 'text', placeholder: '$2M seed', tooltip: 'Total funding amount and stage (e.g., "$2M seed", "$10M Series A")' },
          { key: 'foundersNames', label: 'Founders', kind: 'stringList', span: 2, tooltip: 'Names of company founders (press Enter after each name)' },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'website', label: 'Website', kind: 'url', required: true, tooltip: 'Company website URL' },
          { key: 'linkedinUrl', label: 'LinkedIn', kind: 'url', tooltip: 'Company LinkedIn page' },
          { key: 'twitterUrl', label: 'X / Twitter', kind: 'url', tooltip: 'Company X/Twitter profile' },
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
          { key: 'tagline', label: 'Tagline', kind: 'text', span: 2, required: true, tooltip: 'Brief description of the business (shown in cards and listings)' },
          { key: 'sector', label: 'Sector', kind: 'stringList', span: 2, tooltip: 'Industry categories (e.g., Food & Beverage, Retail, Professional Services, Entertainment)' },
          { key: 'industry', label: 'Industry', kind: 'text', tooltip: 'Specific industry or business type' },
          { key: 'foundedYear', label: 'Founded (year)', kind: 'int', placeholder: '2024', tooltip: 'Year the business was established' },
          { key: 'hqCity', label: 'HQ city', kind: 'text', tooltip: 'City where the business is located' },
          { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true, tooltip: 'Area or district where the business operates' },
          { key: 'priceRange', label: 'Price range', kind: 'enum', options: PRICE_RANGE, tooltip: 'Relative price level for products/services' },
          { key: 'phone', label: 'Phone', kind: 'text', required: true, tooltip: 'Contact phone number' },
          { key: 'email', label: 'Email', kind: 'text', tooltip: 'Contact email address' },
          { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2, tooltip: 'Google Maps or location link' },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'website', label: 'Website', kind: 'url', tooltip: 'Business website URL' },
          { key: 'instagramUrl', label: 'Instagram', kind: 'url', tooltip: 'Instagram profile' },
          { key: 'twitterUrl', label: 'X / Twitter', kind: 'url', tooltip: 'X/Twitter profile' },
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
          { key: 'hostOrSpeaker', label: 'Host / speaker', kind: 'text', required: true, tooltip: 'Name of the host, pastor, or main speaker' },
          { key: 'eventDate', label: 'Event date', kind: 'datetime', blockPast: true, required: true, tooltip: 'When the faith event takes place' },
          { key: 'denomination', label: 'Denomination', kind: 'text', tooltip: 'Religious denomination or faith tradition (e.g., Pentecostal, Baptist, Catholic, Non-denominational)' },
          { key: 'venueName', label: 'Venue', kind: 'text', required: true, tooltip: 'Name of the church, hall, or venue' },
          { key: 'neighbourhood', label: 'Neighbourhood', kind: 'text', required: true, tooltip: 'Area or district where the event is held' },
          { key: 'address', label: 'Address', kind: 'text', span: 2, required: true, tooltip: 'Full street address of the venue' },
          { key: 'mapUrl', label: 'Map link', kind: 'url', span: 2, tooltip: 'Google Maps or location link' },
          { key: 'guestSpeakers', label: 'Guest speakers', kind: 'stringList', span: 2, tooltip: 'Names of additional speakers or guests (press Enter after each name)' },
          { key: 'serviceTimes', label: 'Service times', kind: 'keyValue', span: 2, tooltip: 'Schedule (e.g., Sunday: "9:00 AM – 11:00 AM", Friday: "7:00 PM – 9:00 PM")' },
        ],
      },
      {
        title: 'Attend',
        fields: [
          { key: 'isOnline', label: 'Streamed online', kind: 'boolean', tooltip: 'Toggle if the event will be live-streamed' },
          { key: 'streamUrl', label: 'Stream URL', kind: 'url', tooltip: 'Link to online stream (YouTube, Facebook Live, etc.)' },
          { key: 'registrationUrl', label: 'Registration URL', kind: 'url', tooltip: 'Link to RSVP or register for the event' },
          { key: 'contactPhone', label: 'Contact phone', kind: 'text', tooltip: 'Phone number for inquiries' },
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
            tooltip: 'Category of opportunity (job, grant, fellowship, internship, or scholarship)',
          },
          { key: 'organiser', label: 'Organiser', kind: 'text', required: true, tooltip: 'Company, organization, or institution offering the opportunity' },
          { key: 'deadline', label: 'Deadline', kind: 'date', blockPast: true, required: true, tooltip: 'Application deadline date' },
          { key: 'startDate', label: 'Start date', kind: 'date', blockPast: true, tooltip: 'When the opportunity begins (if applicable)' },
          { key: 'compensation', label: 'Compensation', kind: 'text', placeholder: '₦400k / month', tooltip: 'Salary, stipend, or funding amount (e.g., "₦400k / month", "$50k annually", "Full scholarship")' },
          { key: 'locationType', label: 'Location type', kind: 'text', placeholder: 'Remote / Hybrid / On-site', tooltip: 'Work arrangement (Remote, Hybrid, On-site)' },
          { key: 'isRemote', label: 'Remote', kind: 'boolean', tooltip: 'Toggle if this is a fully remote opportunity' },
          { key: 'duration', label: 'Duration', kind: 'text', placeholder: '6 months', tooltip: 'Length of the opportunity (e.g., "6 months", "2 years", "Permanent")' },
          { key: 'experienceLevel', label: 'Experience level', kind: 'text', tooltip: 'Required experience (e.g., Entry-level, Mid-level, Senior, No experience required)' },
          { key: 'fields', label: 'Fields', kind: 'stringList', span: 2, tooltip: 'Relevant fields or industries (e.g., Technology, Engineering, Healthcare, Education)' },
          { key: 'benefits', label: 'Benefits', kind: 'stringList', span: 2, tooltip: 'Perks and benefits offered (e.g., Health insurance, Mentorship, Travel allowance)' },
          { key: 'eligibility', label: 'Eligibility', kind: 'textarea', span: 2, tooltip: 'Who can apply and any specific requirements or restrictions' },
          { key: 'applyUrl', label: 'Apply URL', kind: 'url', span: 2, required: true, tooltip: 'Link to the application page or form' },
        ],
      },
    ],
  },
};

export const CONTENT_TYPE_KEYS = Object.keys(CONTENT_TYPES);
