/**
 * Dummy data for development and design — matches the homepage structure
 * from the design prototype. Remove or gate with `if (process.env.NODE_ENV === 'development')`
 * once the CMS is populated.
 */

import type { ContentCard, HomepageShelf } from '@/lib/api/types';

export const DUMMY_FEATURED: ContentCard = {
  id: 'featured-1',
  type: 'READ',
  title: 'Registering Your Business with CAC Is Only the Beginning',
  slug: 'registering-business-cac-beginning',
  status: 'PUBLISHED',
  excerpt:
    'Seven compliance issues Nigerian business owners should consider after registration',
  publishDate: new Date('2026-09-05').toISOString(),
  featured: true,
  viewCount: 1250,
  coverImage: {
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=675&fit=crop',
    alt: 'Business registration document',
    width: 1200,
    height: 675,
  },
  cities: [{ id: '1', name: 'Lagos', slug: 'lagos' }],
  categories: [{ id: '1', name: 'Must read' }],
};

const createDummyCard = (
  id: string,
  type: ContentCard['type'],
  title: string,
  imageUrl: string,
  category?: string,
): ContentCard => ({
  id,
  type,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  status: 'PUBLISHED',
  excerpt: `Discover ${title.toLowerCase()} and more happening in Lagos this week.`,
  publishDate: new Date('2026-09-08').toISOString(),
  featured: false,
  viewCount: Math.floor(Math.random() * 500) + 100,
  coverImage: {
    url: imageUrl,
    alt: title,
    width: 800,
    height: 500,
  },
  cities: [{ id: '1', name: 'Lagos', slug: 'lagos' }],
  categories: category ? [{ id: '1', name: category }] : [],
});

export const DUMMY_SHELVES: HomepageShelf[] = [
  {
    key: 'most-popular',
    title: 'Most Popular',
    items: [
      createDummyCard(
        'pop-1',
        'STARTUP',
        'Chow Central Inc',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
        'Y Combinator S23',
      ),
      createDummyCard(
        'pop-2',
        'SONG',
        'A*POP',
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=500&fit=crop',
        'Music',
      ),
      createDummyCard(
        'pop-3',
        'HOTEL',
        'Eko Hotels & Suites',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop',
        'Hotels',
      ),
    ],
  },
  {
    key: 'most-recent',
    title: 'Most Recent',
    items: [
      createDummyCard(
        'recent-1',
        'READ',
        "Bridging the gap in Nigeria's current recovery cycle",
        'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&h=500&fit=crop',
        'Business',
      ),
      createDummyCard(
        'recent-2',
        'OPPORTUNITY',
        'African Fashion FundLab Fellowship 2026',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
        'Fellowship',
      ),
      createDummyCard(
        'recent-3',
        'EVENT',
        'Lagos Tech Summit 2026',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop',
        'Events',
      ),
      createDummyCard(
        'recent-4',
        'SONG',
        'Oriadé',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop',
        'Music',
      ),
    ],
  },
  {
    key: 'opportunities',
    title: 'Opportunities',
    items: [
      createDummyCard(
        'opp-1',
        'OPPORTUNITY',
        'Mastercard Foundation × CcHUB GATEWAY Digital Skills Program 2026',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop',
        'Training',
      ),
      createDummyCard(
        'opp-2',
        'OPPORTUNITY',
        'Shell Assessed Internship Programme 2027',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
        'Internship',
      ),
      createDummyCard(
        'opp-3',
        'OPPORTUNITY',
        'Tech Women Fest Laptop Initiative 2026',
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=500&fit=crop',
        'Grant',
      ),
      createDummyCard(
        'opp-4',
        'OPPORTUNITY',
        'Connect Nigeria Is Hiring',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop',
        'Job',
      ),
    ],
  },
  {
    key: 'music',
    title: 'Music',
    items: [
      createDummyCard(
        'music-1',
        'SONG',
        'STARLIFE',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'music-2',
        'SONG',
        'Lagos Nights',
        'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'music-3',
        'SONG',
        'Afrobeat Vibes Vol. 2',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop',
      ),
    ],
  },
  {
    key: 'hotels',
    title: 'Hotels',
    items: [
      createDummyCard(
        'hotel-1',
        'HOTEL',
        'Hotelinn Oniru',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'hotel-2',
        'HOTEL',
        'Legend Hotel Lagos Airport',
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'hotel-3',
        'HOTEL',
        'Radisson Blu Anchorage Hotel',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop',
      ),
    ],
  },
  {
    key: 'startups',
    title: 'Startups',
    items: [
      createDummyCard(
        'startup-1',
        'STARTUP',
        'Miden',
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop',
        'Y Combinator W24',
      ),
      createDummyCard(
        'startup-2',
        'STARTUP',
        'Waza',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop',
        'Y Combinator W23',
      ),
      createDummyCard(
        'startup-3',
        'STARTUP',
        'Flick',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
        'Y Combinator S24',
      ),
    ],
  },
  {
    key: 'events',
    title: 'Events',
    items: [
      createDummyCard(
        'event-1',
        'EVENT',
        'Becky Chambers in Conversation With Ty Franck',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'event-2',
        'EVENT',
        'Helen Scheuerer in Conversation With Demi Winters',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'event-3',
        'EVENT',
        'Teaching With Purpose — 25 Years',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=500&fit=crop',
      ),
    ],
  },
  {
    key: 'must-read',
    title: 'Must Read',
    items: [
      createDummyCard(
        'read-1',
        'READ',
        'Santo Antão: The Lost Paradise',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
        'Travel',
      ),
      createDummyCard(
        'read-2',
        'READ',
        'Zero To One: Uber Just Quit Nigeria',
        'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&h=500&fit=crop',
        'Business',
      ),
      createDummyCard(
        'read-3',
        'READ',
        'How to Encourage More Women Into Business and Tech',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=500&fit=crop',
        'Opinion',
      ),
    ],
  },
  {
    key: 'video',
    title: 'Video',
    items: [
      createDummyCard(
        'video-1',
        'VIDEO',
        'Lagos Public Transport | How the BRT Bus System Works',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'video-2',
        'VIDEO',
        "I spent 100 hours living in the world's richest beach city",
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'video-3',
        'VIDEO',
        'How to research like a professional',
        'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=500&fit=crop',
      ),
    ],
  },
  {
    key: 'new-business',
    title: 'New Business',
    items: [
      createDummyCard(
        'biz-1',
        'BUSINESS',
        'Kuda',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
        'Banking',
      ),
      createDummyCard(
        'biz-2',
        'BUSINESS',
        'Paystack',
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=500&fit=crop',
        'Fintech',
      ),
      createDummyCard(
        'biz-3',
        'BUSINESS',
        'QuoteRequest',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop',
        'Marketplace',
      ),
    ],
  },
  {
    key: 'places',
    title: 'Places',
    items: [
      createDummyCard(
        'place-1',
        'RESTAURANT',
        'Nok by Alara',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'place-2',
        'RESTAURANT',
        'Yellow Chilli',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop',
      ),
      createDummyCard(
        'place-3',
        'RESTAURANT',
        'Shiro Lagos',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop',
      ),
    ],
  },
];
