export type Category =
  | 'Beachfront'
  | 'Mountain'
  | 'City'
  | 'Countryside'
  | 'Desert'
  | 'Island'

export type PropertyType = 'Villa' | 'Penthouse' | 'Chalet' | 'Loft' | 'Cabin' | 'Riad' | 'Estate'

export interface Host {
  id: string
  name: string
  avatar: string
  city: string
  joined: number
  superhost: boolean
  responseRate: number
  responseTime: string
  languages: string[]
  bio: string
}

export interface Review {
  id: string
  author: string
  avatar: string
  date: string
  rating: number
  text: string
}

export interface Listing {
  id: string
  title: string
  tagline: string
  city: string
  country: string
  category: Category
  type: PropertyType
  price: number
  cleaningFee: number
  rating: number
  reviewCount: number
  guests: number
  bedrooms: number
  beds: number
  baths: number
  images: string[]
  amenities: string[]
  hostId: string
  instantBook: boolean
  description: string
  highlights: { title: string; text: string }[]
  custom?: boolean
}

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const img = u

export const AMENITIES = [
  'Private pool',
  'Ocean view',
  'Mountain view',
  'Hot tub',
  'Chef’s kitchen',
  'Wi‑Fi',
  'Air conditioning',
  'Fireplace',
  'Home cinema',
  'Gym',
  'Sauna',
  'Wine cellar',
  'Free parking',
  'EV charger',
  'Concierge',
  'Private chef',
  'Workspace',
  'Garden',
] as const

export const CATEGORIES: { name: Category; icon: string }[] = [
  { name: 'Beachfront', icon: 'wave' },
  { name: 'Mountain', icon: 'mountain' },
  { name: 'City', icon: 'city' },
  { name: 'Countryside', icon: 'leaf' },
  { name: 'Desert', icon: 'sun' },
  { name: 'Island', icon: 'palm' },
]

export const PROPERTY_TYPES: PropertyType[] = [
  'Villa',
  'Penthouse',
  'Chalet',
  'Loft',
  'Cabin',
  'Riad',
  'Estate',
]

export const HOSTS: Host[] = [
  {
    id: 'h1',
    name: 'Isabelle Moreau',
    avatar: u('1494790108377-be9c29b29330', 300),
    city: 'Antibes, France',
    joined: 2016,
    superhost: true,
    responseRate: 100,
    responseTime: 'within an hour',
    languages: ['English', 'French', 'Italian'],
    bio: 'Former interior architect turned host. I restore homes with soul and fill them with light, linen and quiet luxury. Every stay comes with my personal guide to the coast.',
  },
  {
    id: 'h2',
    name: 'Kenji Watanabe',
    avatar: u('1507003211169-0a1dd7228f2d', 300),
    city: 'Kyoto, Japan',
    joined: 2018,
    superhost: true,
    responseRate: 99,
    responseTime: 'within an hour',
    languages: ['English', 'Japanese'],
    bio: 'Architect and tea enthusiast. My homes are designed around stillness: natural materials, soft light and views that slow you down.',
  },
  {
    id: 'h3',
    name: 'Amara Okafor',
    avatar: u('1438761681033-6461ffad8d80', 300),
    city: 'Cape Town, South Africa',
    joined: 2019,
    superhost: false,
    responseRate: 96,
    responseTime: 'within a few hours',
    languages: ['English', 'Afrikaans'],
    bio: 'I curate design-led homes between the ocean and the vineyards. Ask me for the best sunset spots and table reservations.',
  },
  {
    id: 'h4',
    name: 'Lukas Brenner',
    avatar: u('1500648767791-00dcc994a43e', 300),
    city: 'Zermatt, Switzerland',
    joined: 2015,
    superhost: true,
    responseRate: 100,
    responseTime: 'within an hour',
    languages: ['English', 'German', 'French'],
    bio: 'Mountain guide and chalet keeper for three generations. Warm fires, hearty breakfasts and ski-in, ski-out access are my specialty.',
  },
  {
    id: 'h5',
    name: 'Sofia Laurent',
    avatar: u('1534528741775-53994a69daeb', 300),
    city: 'Dubai, UAE',
    joined: 2020,
    superhost: true,
    responseRate: 98,
    responseTime: 'within an hour',
    languages: ['English', 'Arabic', 'French'],
    bio: 'Hospitality professional with a love for skyline views and seamless service. Private chefs, chauffeurs and yacht days on request.',
  },
]

const A = (...xs: string[]) => xs

export const LISTINGS: Listing[] = [
  {
    id: 'villa-aurelia',
    title: 'Villa Aurélia',
    tagline: 'Cliffside villa above the Mediterranean',
    city: 'Antibes',
    country: 'France',
    category: 'Beachfront',
    type: 'Villa',
    price: 1450,
    cleaningFee: 280,
    rating: 4.97,
    reviewCount: 128,
    guests: 10,
    bedrooms: 5,
    beds: 6,
    baths: 5,
    images: [
      u('1613490493576-7fde63acd811'),
      u('1600607687939-ce8a6c25118c'),
      u('1600566753190-17f0baa2a6c3'),
      u('1616594039964-ae9021a400a0'),
      u('1505693416388-ac5ce068fe85'),
    ],
    amenities: A('Private pool', 'Ocean view', 'Chef’s kitchen', 'Wi‑Fi', 'Air conditioning', 'Wine cellar', 'Free parking', 'Concierge', 'Garden'),
    hostId: 'h1',
    instantBook: true,
    description:
      'Perched above a private cove on Cap d’Antibes, Villa Aurélia pairs Belle Époque bones with a warm, contemporary interior. Wake to sea light pouring through steel-framed windows, swim in the infinity pool carved into the rock, and end the day on the terrace as the lighthouse flickers on.',
    highlights: [
      { title: 'Private sea access', text: 'Stone steps lead down to a secluded swimming cove.' },
      { title: 'Self check-in with concierge', text: 'Arrive any time; our team is on call 24/7.' },
      { title: 'Chef on request', text: 'Provençal tasting menus served on the terrace.' },
    ],
  },
  {
    id: 'kyoto-machiya',
    title: 'Hoshizora House',
    tagline: 'Restored machiya with a private onsen bath',
    city: 'Kyoto',
    country: 'Japan',
    category: 'City',
    type: 'Estate',
    price: 690,
    cleaningFee: 120,
    rating: 4.99,
    reviewCount: 214,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    images: [
      u('1540959733332-eab4deabeeaf'),
      u('1600210492486-724fe5c67fb0'),
      u('1618773928121-c32242e63f39'),
      u('1586023492125-27b2c045efd7'),
      u('1631049307264-da0ec9d70304'),
    ],
    amenities: A('Hot tub', 'Wi‑Fi', 'Air conditioning', 'Garden', 'Workspace', 'Concierge'),
    hostId: 'h2',
    instantBook: true,
    description:
      'A 120-year-old townhouse in Higashiyama, rebuilt by hand with hinoki cypress, washi paper and a stone courtyard garden. Soak in the cedar onsen bath under the open sky, then walk five minutes to the lantern-lit lanes of Gion.',
    highlights: [
      { title: 'Walk to temples', text: 'Kiyomizu-dera and Yasaka Shrine are minutes away.' },
      { title: 'Private onsen', text: 'Natural mineral water, drawn fresh every evening.' },
      { title: 'Tea ceremony', text: 'An optional private ceremony with your host.' },
    ],
  },
  {
    id: 'zermatt-chalet',
    title: 'Chalet Edelweiss',
    tagline: 'Ski-in, ski-out with Matterhorn views',
    city: 'Zermatt',
    country: 'Switzerland',
    category: 'Mountain',
    type: 'Chalet',
    price: 2100,
    cleaningFee: 350,
    rating: 4.95,
    reviewCount: 87,
    guests: 12,
    bedrooms: 6,
    beds: 7,
    baths: 6,
    images: [
      u('1476514525535-07fb3b4ae5f1'),
      u('1600585154340-be6161a56a0c'),
      u('1616594039964-ae9021a400a0'),
      u('1540518614846-7eded433c457'),
      u('1484154218962-a197022b5858'),
    ],
    amenities: A('Mountain view', 'Hot tub', 'Fireplace', 'Sauna', 'Chef’s kitchen', 'Wi‑Fi', 'Home cinema', 'Wine cellar', 'Private chef', 'Concierge'),
    hostId: 'h4',
    instantBook: false,
    description:
      'Timber, stone and glass rise over five levels with an uninterrupted view of the Matterhorn. Ski straight to the door, warm up by the double-sided fireplace, then retreat to the spa floor with sauna, hammam and an outdoor hot tub under the stars.',
    highlights: [
      { title: 'Ski-in, ski-out', text: 'Direct piste access with a heated boot room.' },
      { title: 'Full-time chalet staff', text: 'Breakfast, afternoon tea and a four-course dinner daily.' },
      { title: 'Spa floor', text: 'Sauna, hammam and outdoor hot tub.' },
    ],
  },
  {
    id: 'dubai-penthouse',
    title: 'The Marina Sky Penthouse',
    tagline: 'Floor-to-ceiling skyline from the 72nd floor',
    city: 'Dubai',
    country: 'UAE',
    category: 'City',
    type: 'Penthouse',
    price: 1250,
    cleaningFee: 200,
    rating: 4.9,
    reviewCount: 156,
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 4,
    images: [
      u('1512453979798-5ea266f8880c'),
      u('1600210492486-724fe5c67fb0'),
      u('1582719478250-c89cae4dc85b'),
      u('1556909114-f6e7ad7d3136'),
      u('1505693416388-ac5ce068fe85'),
    ],
    amenities: A('Private pool', 'Ocean view', 'Gym', 'Wi‑Fi', 'Air conditioning', 'Home cinema', 'Concierge', 'Free parking', 'EV charger'),
    hostId: 'h5',
    instantBook: true,
    description:
      'A duplex penthouse wrapped in glass, with a heated plunge pool on the terrace and a sunset view across the Arabian Gulf. Interiors are layered with smoked oak, brass and travertine, and a dedicated concierge arranges yachts, desert dinners and chauffeurs.',
    highlights: [
      { title: 'Rooftop plunge pool', text: 'Heated year-round, overlooking the marina.' },
      { title: 'Private chauffeur', text: 'Airport transfer included with every stay.' },
      { title: 'Great for business', text: 'Fiber Wi‑Fi and a dedicated study.' },
    ],
  },
  {
    id: 'bali-retreat',
    title: 'Sanctuary Ubud',
    tagline: 'Jungle pavilions above a sacred river',
    city: 'Ubud',
    country: 'Indonesia',
    category: 'Island',
    type: 'Villa',
    price: 540,
    cleaningFee: 90,
    rating: 4.96,
    reviewCount: 302,
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3,
    images: [
      u('1537996194471-e657df975ab4'),
      u('1520250497591-112f2f40a3f4'),
      u('1540518614846-7eded433c457'),
      u('1586023492125-27b2c045efd7'),
      u('1571896349842-33c89424de2d'),
    ],
    amenities: A('Private pool', 'Garden', 'Wi‑Fi', 'Air conditioning', 'Private chef', 'Workspace', 'Concierge'),
    hostId: 'h3',
    instantBook: true,
    description:
      'Three open-air pavilions of bamboo and teak float above the Ayung river valley. Morning yoga on the deck, floating breakfast in the pool and a private chef for Balinese feasts by candlelight.',
    highlights: [
      { title: 'Daily housekeeping', text: 'Fresh flowers and turndown every evening.' },
      { title: 'Wellness included', text: 'Two in-villa massages per stay.' },
      { title: 'Rice terrace walks', text: 'Guided sunrise treks from the door.' },
    ],
  },
  {
    id: 'mykonos-villa',
    title: 'Villa Lefkí',
    tagline: 'Whitewashed hideaway with sunset decks',
    city: 'Mykonos',
    country: 'Greece',
    category: 'Island',
    type: 'Villa',
    price: 1680,
    cleaningFee: 260,
    rating: 4.93,
    reviewCount: 74,
    guests: 8,
    bedrooms: 4,
    beds: 5,
    baths: 4,
    images: [
      u('1533104816931-20fa691ff6ca'),
      u('1499793983690-e29da59ef1c2'),
      u('1600566753190-17f0baa2a6c3'),
      u('1618773928121-c32242e63f39'),
      u('1484154218962-a197022b5858'),
    ],
    amenities: A('Private pool', 'Ocean view', 'Wi‑Fi', 'Air conditioning', 'Chef’s kitchen', 'Free parking', 'Concierge'),
    hostId: 'h1',
    instantBook: false,
    description:
      'Cycladic curves, sun-bleached linen and a cantilevered pool that seems to pour into the Aegean. Watch the sun drop behind Delos from three tiered terraces, each with its own lounge and outdoor shower.',
    highlights: [
      { title: 'Sunset terraces', text: 'West-facing decks on three levels.' },
      { title: 'Boat day', text: 'Private yacht charters arranged on request.' },
      { title: '5 min to Psarou', text: 'The island’s most celebrated beach.' },
    ],
  },
  {
    id: 'marrakech-riad',
    title: 'Riad Noor',
    tagline: 'Candlelit courtyard in the old medina',
    city: 'Marrakech',
    country: 'Morocco',
    category: 'Desert',
    type: 'Riad',
    price: 420,
    cleaningFee: 70,
    rating: 4.92,
    reviewCount: 189,
    guests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 4,
    images: [
      u('1597212618440-806262de4f6b'),
      u('1566073771259-6a8506099945'),
      u('1582719478250-c89cae4dc85b'),
      u('1616594039964-ae9021a400a0'),
      u('1631049307264-da0ec9d70304'),
    ],
    amenities: A('Private pool', 'Hot tub', 'Wi‑Fi', 'Air conditioning', 'Private chef', 'Garden', 'Concierge'),
    hostId: 'h3',
    instantBook: true,
    description:
      'Behind a cedar door, a hidden world: zellige-tiled courtyard, orange trees and a plunge pool glowing beneath brass lanterns. Breakfast on the rooftop, hammam rituals in the cellar and a private cook for tagines at dusk.',
    highlights: [
      { title: 'Exclusive use', text: 'The entire riad is yours, with staff.' },
      { title: 'Rooftop terrace', text: 'Views across the medina to the Atlas.' },
      { title: 'Desert excursions', text: 'Overnight Agafay camps arranged for you.' },
    ],
  },
  {
    id: 'tulum-casa',
    title: 'Casa Selva',
    tagline: 'Concrete and palm on a private beach',
    city: 'Tulum',
    country: 'Mexico',
    category: 'Beachfront',
    type: 'Villa',
    price: 890,
    cleaningFee: 150,
    rating: 4.88,
    reviewCount: 98,
    guests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 4,
    images: [
      u('1507525428034-b723cf961d3e'),
      u('1564013799919-ab600027ffc6'),
      u('1600607687939-ce8a6c25118c'),
      u('1540518614846-7eded433c457'),
      u('1556909114-f6e7ad7d3136'),
    ],
    amenities: A('Private pool', 'Ocean view', 'Wi‑Fi', 'Air conditioning', 'Garden', 'Private chef', 'Workspace'),
    hostId: 'h5',
    instantBook: true,
    description:
      'Sculptural chukum walls curve around a jungle courtyard that opens straight onto white sand. Hammocks, an outdoor shower beneath a ceiba tree and a rooftop palapa for full-moon dinners.',
    highlights: [
      { title: 'Steps to the sand', text: 'A private gate opens onto the Caribbean.' },
      { title: 'Eco-designed', text: 'Solar powered with rainwater systems.' },
      { title: 'Cenote tours', text: 'Private morning swims before the crowds.' },
    ],
  },
  {
    id: 'tuscany-estate',
    title: 'Tenuta del Sole',
    tagline: 'Vineyard estate in the Chianti hills',
    city: 'Siena',
    country: 'Italy',
    category: 'Countryside',
    type: 'Estate',
    price: 1150,
    cleaningFee: 240,
    rating: 4.98,
    reviewCount: 66,
    guests: 14,
    bedrooms: 7,
    beds: 8,
    baths: 7,
    images: [
      u('1516483638261-f4dbaf036963'),
      u('1512917774080-9991f1c4c750'),
      u('1600210492486-724fe5c67fb0'),
      u('1505693416388-ac5ce068fe85'),
      u('1484154218962-a197022b5858'),
    ],
    amenities: A('Private pool', 'Mountain view', 'Chef’s kitchen', 'Wine cellar', 'Fireplace', 'Wi‑Fi', 'Free parking', 'Garden', 'Private chef', 'Gym'),
    hostId: 'h1',
    instantBook: false,
    description:
      'A 16th-century stone farmhouse surrounded by its own vines and olive groves. Long lunches under the pergola, a travertine pool overlooking the valley and private tastings of the estate’s Chianti Classico.',
    highlights: [
      { title: 'Own vineyard', text: 'Private tastings in the barrel cellar.' },
      { title: 'Cooking classes', text: 'Hand-made pasta with the estate nonna.' },
      { title: 'Perfect for celebrations', text: 'Room for 14 with a 20-seat dining hall.' },
    ],
  },
  {
    id: 'cape-town-villa',
    title: 'Clifton Glasshouse',
    tagline: 'Atlantic-facing glass villa on the cliffs',
    city: 'Cape Town',
    country: 'South Africa',
    category: 'Beachfront',
    type: 'Villa',
    price: 980,
    cleaningFee: 160,
    rating: 4.94,
    reviewCount: 112,
    guests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 5,
    images: [
      u('1580587771525-78b9dba3b914'),
      u('1600596542815-ffad4c1539a9'),
      u('1600566753190-17f0baa2a6c3'),
      u('1618773928121-c32242e63f39'),
      u('1556909114-f6e7ad7d3136'),
    ],
    amenities: A('Private pool', 'Ocean view', 'Gym', 'Home cinema', 'Wi‑Fi', 'Air conditioning', 'Wine cellar', 'Free parking', 'EV charger'),
    hostId: 'h3',
    instantBook: true,
    description:
      'Four floors of glass and white oak stacked into the cliffs above Clifton’s 4th Beach, with Lion’s Head behind and nothing but ocean ahead. A heated rim-flow pool, cinema room and a sommelier-stocked cellar of Cape wines.',
    highlights: [
      { title: 'Beach in 2 minutes', text: 'Private path to Clifton 4th Beach.' },
      { title: 'Winelands trips', text: 'Chauffeured tours to Franschhoek.' },
      { title: 'Backup power', text: 'Solar and battery for uninterrupted stays.' },
    ],
  },
  {
    id: 'paris-loft',
    title: 'Atelier Saint-Germain',
    tagline: 'Artist’s loft with Eiffel Tower views',
    city: 'Paris',
    country: 'France',
    category: 'City',
    type: 'Loft',
    price: 760,
    cleaningFee: 110,
    rating: 4.91,
    reviewCount: 243,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    images: [
      u('1502602898657-3e91760cbb34'),
      u('1522708323590-d24dbb6b0267'),
      u('1502672260266-1c1ef2d93688'),
      u('1631049307264-da0ec9d70304'),
      u('1484154218962-a197022b5858'),
    ],
    amenities: A('Wi‑Fi', 'Air conditioning', 'Fireplace', 'Workspace', 'Chef’s kitchen', 'Concierge'),
    hostId: 'h1',
    instantBook: true,
    description:
      'A former sculptor’s atelier under a soaring glass roof on the Left Bank. Herringbone floors, a marble fireplace and a balcony with a direct line of sight to the Eiffel Tower sparkle every hour after dark.',
    highlights: [
      { title: 'Left Bank location', text: 'Cafés, galleries and the Luxembourg Gardens nearby.' },
      { title: 'Glass atelier roof', text: 'Flooded with light from dawn to dusk.' },
      { title: 'Restaurant bookings', text: 'Your host secures the hard-to-get tables.' },
    ],
  },
  {
    id: 'aspen-cabin',
    title: 'Ember Ridge Lodge',
    tagline: 'Timber lodge in the aspen forest',
    city: 'Aspen',
    country: 'United States',
    category: 'Mountain',
    type: 'Cabin',
    price: 1320,
    cleaningFee: 300,
    rating: 4.89,
    reviewCount: 58,
    guests: 10,
    bedrooms: 5,
    beds: 6,
    baths: 5,
    images: [
      u('1600585154340-be6161a56a0c'),
      u('1476514525535-07fb3b4ae5f1'),
      u('1586023492125-27b2c045efd7'),
      u('1540518614846-7eded433c457'),
      u('1556909114-f6e7ad7d3136'),
    ],
    amenities: A('Mountain view', 'Hot tub', 'Fireplace', 'Sauna', 'Gym', 'Home cinema', 'Wi‑Fi', 'Free parking', 'EV charger', 'Chef’s kitchen'),
    hostId: 'h4',
    instantBook: false,
    description:
      'Reclaimed timber, river stone and walls of glass framing a private aspen grove. Soak in the cedar hot tub as snow falls, gather around the 20-foot stone hearth and ride the free shuttle to the gondola.',
    highlights: [
      { title: 'Ski shuttle', text: 'Private driver to Aspen Mountain and Snowmass.' },
      { title: 'Wellness wing', text: 'Sauna, cold plunge and a fully equipped gym.' },
      { title: 'Stargazing deck', text: 'Telescope and fire pit under dark skies.' },
    ],
  },
]

export const DESTINATIONS = [
  { city: 'Antibes', country: 'France', image: u('1499793983690-e29da59ef1c2', 900), stays: 24 },
  { city: 'Kyoto', country: 'Japan', image: u('1540959733332-eab4deabeeaf', 900), stays: 18 },
  { city: 'Zermatt', country: 'Switzerland', image: u('1476514525535-07fb3b4ae5f1', 900), stays: 12 },
  { city: 'Marrakech', country: 'Morocco', image: u('1597212618440-806262de4f6b', 900), stays: 31 },
  { city: 'Mykonos', country: 'Greece', image: u('1533104816931-20fa691ff6ca', 900), stays: 27 },
]

const REVIEWERS = [
  { author: 'Charlotte', avatar: u('1544005313-94ddf0286df2', 200) },
  { author: 'Marcus', avatar: u('1506794778202-cad84cf45f1d', 200) },
  { author: 'Elena', avatar: u('1531746020798-e6953c6e8e04', 200) },
  { author: 'James', avatar: u('1472099645785-5658abf4ff4e', 200) },
  { author: 'Priya', avatar: u('1488426862026-3ee34a7d66df', 200) },
  { author: 'Oliver', avatar: u('1519085360753-af0119f7cbe7', 200) },
]

const REVIEW_TEXTS = [
  'Beyond our expectations. Every detail was considered, from the linens to the lighting at night. We are already planning our return.',
  'The photos don’t do it justice. Our host anticipated everything we needed and the views were breathtaking.',
  'An absolute sanctuary. Impeccably clean, beautifully designed and so peaceful. The concierge service was flawless.',
  'We celebrated our anniversary here and it was perfect. The private chef dinner was the highlight of our trip.',
  'Stunning home in an unbeatable location. Check-in was seamless and communication was warm and fast.',
  'Felt like staying in a design magazine, yet completely comfortable. Our kids didn’t want to leave.',
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October']

export function reviewsFor(listing: Listing): Review[] {
  const seed = listing.id.length
  return REVIEW_TEXTS.map((text, i) => {
    const r = REVIEWERS[(i + seed) % REVIEWERS.length]
    return {
      id: `${listing.id}-r${i}`,
      author: r.author,
      avatar: r.avatar,
      date: `${MONTHS[(i * 3 + seed) % MONTHS.length]} 2026`,
      rating: i % 4 === 3 ? 4 : 5,
      text,
    }
  })
}

export function getHost(id: string): Host | undefined {
  return HOSTS.find((h) => h.id === id)
}
