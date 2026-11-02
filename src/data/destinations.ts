import { img } from './listings'

export interface Guide {
  slug: string
  city: string
  country: string
  region: string
  image: string
  intro: string
  bestTime: string
  flight: string
  dontMiss: string[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'antibes',
    city: 'Antibes',
    country: 'France',
    region: 'Europe',
    image: img('1499793983690-e29da59ef1c2', 1800),
    intro: 'Old ramparts, Picasso’s seaside studio and the quiet coves of Cap d’Antibes, halfway between Cannes and Nice.',
    bestTime: 'May – June, September',
    flight: '20 min from Nice Côte d’Azur',
    dontMiss: ['Sunset swim at Plage de la Garoupe', 'Marché Provençal on a Saturday morning', 'Musée Picasso in the Château Grimaldi', 'Coastal path around the Cap'],
  },
  {
    slug: 'kyoto',
    city: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    image: img('1540959733332-eab4deabeeaf', 1800),
    intro: 'Seventeen UNESCO sites, lantern-lit lanes in Gion and gardens designed to be looked at for a lifetime.',
    bestTime: 'Late March – April, November',
    flight: '75 min by train from Kansai International',
    dontMiss: ['Fushimi Inari at dawn, before the crowds', 'Kaiseki dinner in Pontocho', 'Arashiyama bamboo grove', 'Private tea ceremony with your host'],
  },
  {
    slug: 'zermatt',
    city: 'Zermatt',
    country: 'Switzerland',
    region: 'Europe',
    image: img('1476514525535-07fb3b4ae5f1', 1800),
    intro: 'A car-free village under the Matterhorn, with 360 km of pistes and glacier skiing all year.',
    bestTime: 'December – April for skiing, July – August for hiking',
    flight: '3.5 h by train from Zurich or Geneva',
    dontMiss: ['Sunrise from Gornergrat', 'Lunch at a mountain hut on the Italian side', 'The Five Lakes Walk in summer', 'Après-ski by the fire'],
  },
  {
    slug: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    image: img('1512453979798-5ea266f8880c', 1800),
    intro: 'Skyline penthouses, desert dinners under the stars and some of the best restaurants in the world.',
    bestTime: 'November – March',
    flight: '25 min from DXB',
    dontMiss: ['Sunset dune drive and Bedouin dinner', 'Old Dubai souks by abra', 'Yacht day off the Palm', 'Brunch on a Friday'],
  },
  {
    slug: 'ubud',
    city: 'Ubud',
    country: 'Indonesia',
    region: 'Asia',
    image: img('1537996194471-e657df975ab4', 1800),
    intro: 'Bali’s green heart: rice terraces, river valleys, temples and the island’s best wellness retreats.',
    bestTime: 'April – October',
    flight: '75 min from Denpasar',
    dontMiss: ['Tegallalang terraces at sunrise', 'Campuhan Ridge walk', 'Water purification at Tirta Empul', 'A Balinese cooking class'],
  },
  {
    slug: 'mykonos',
    city: 'Mykonos',
    country: 'Greece',
    region: 'Europe',
    image: img('1533104816931-20fa691ff6ca', 1800),
    intro: 'Whitewashed lanes, windmills and long lunches on the sand, with Delos a short boat ride away.',
    bestTime: 'June, September',
    flight: '10 min from Mykonos airport',
    dontMiss: ['Sunset in Little Venice', 'Morning boat to Delos', 'Lunch at Kiki’s Tavern', 'Private yacht around the south coast'],
  },
  {
    slug: 'marrakech',
    city: 'Marrakech',
    country: 'Morocco',
    region: 'Africa',
    image: img('1597212618440-806262de4f6b', 1800),
    intro: 'Hidden riads, spice-scented souks and the Atlas mountains on the horizon.',
    bestTime: 'March – May, October – November',
    flight: '15 min from Menara airport',
    dontMiss: ['Jardin Majorelle early in the morning', 'Hammam ritual', 'A night camp in the Agafay desert', 'Rooftop dinner over Jemaa el-Fnaa'],
  },
  {
    slug: 'tulum',
    city: 'Tulum',
    country: 'Mexico',
    region: 'Americas',
    image: img('1507525428034-b723cf961d3e', 1800),
    intro: 'Mayan ruins above Caribbean sand, jungle restaurants and swims in crystal cenotes.',
    bestTime: 'December – April',
    flight: '30 min from Tulum international',
    dontMiss: ['Cenote swim before 9 am', 'The ruins at opening time', 'Dinner at a jungle restaurant', 'Sian Ka’an biosphere by boat'],
  },
  {
    slug: 'siena',
    city: 'Siena',
    country: 'Italy',
    region: 'Europe',
    image: img('1516483638261-f4dbaf036963', 1800),
    intro: 'Gothic Siena and the rolling Chianti hills: vineyards, cypress roads and long Tuscan lunches.',
    bestTime: 'May – June, September – October',
    flight: '1 h from Florence',
    dontMiss: ['Piazza del Campo at golden hour', 'Chianti Classico tasting', 'Hot springs at Bagno Vignoni', 'Truffle hunting in the autumn'],
  },
  {
    slug: 'cape-town',
    city: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    image: img('1580587771525-78b9dba3b914', 1800),
    intro: 'Table Mountain, Atlantic beaches and the Winelands an hour away.',
    bestTime: 'November – March',
    flight: '25 min from Cape Town International',
    dontMiss: ['Lion’s Head at sunrise', 'Boulders Beach penguins', 'Long lunch in Franschhoek', 'Chapman’s Peak drive'],
  },
  {
    slug: 'paris',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    image: img('1502602898657-3e91760cbb34', 1800),
    intro: 'Left Bank ateliers, Michelin tables and the Eiffel Tower sparkling on the hour.',
    bestTime: 'April – June, September – October',
    flight: '35 min from Charles de Gaulle',
    dontMiss: ['Musée d’Orsay on a weekday morning', 'Picnic at Place Dauphine', 'Dinner in Saint-Germain', 'A Seine walk at night'],
  },
  {
    slug: 'aspen',
    city: 'Aspen',
    country: 'United States',
    region: 'Americas',
    image: img('1600585154340-be6161a56a0c', 1800),
    intro: 'Four ski mountains, a historic Victorian town and summer music under the aspens.',
    bestTime: 'December – March, July – August',
    flight: '10 min from Aspen/Pitkin County',
    dontMiss: ['First chair on Aspen Mountain', 'Maroon Bells at sunrise', 'Aspen Music Festival', 'Hot springs in Glenwood'],
  },
]

export const guideByCity = (city: string) => GUIDES.find((g) => g.city.toLowerCase() === city.toLowerCase())
