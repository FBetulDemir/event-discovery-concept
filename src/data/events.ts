import type { Event } from '@/types/event';

/** Fictional prototype listings. Photos illustrate atmosphere, not the named venues. */
export const events: Event[] = [
  {
    id: 'yaki-da', slug: 'yaki-da-all-night-long', title: 'All night long',
    image: '/images/club.jpg', imageAlt: 'En bartender blandar en drink i färgstarkt barljus',
    date: '2026-09-25', time: '22:00–03:00', venue: 'Yaki-Da', city: 'Göteborg',
    distanceKm: 1.8, price: 180, category: 'Klubb', moods: ['Dansa', 'Hänga'],
    ageRestriction: 23, available: true,
    description: 'Ett hus, flera dansgolv och en kväll att försvinna in i. House, disco och nya favoriter hela vägen till sista låten.',
  },
  {
    id: 'tradgarn', slug: 'under-bar-himmel', title: 'Under bar himmel',
    image: '/images/live.jpg', imageAlt: 'Publik framför en upplyst konsertscen',
    date: '2026-09-25', time: '19:00–01:00', venue: 'Trädgår’n', city: 'Göteborg',
    distanceKm: 2.1, price: 295, category: 'Livemusik', moods: ['Livemusik', 'Dansa'],
    ageRestriction: 18, available: true,
    description: 'Stora refränger och den där känslan när hela publiken sjunger med. Samla vännerna för en kväll fylld av livemusik.',
  },
  {
    id: 'standup', slug: 'ett-riktigt-gott-skratt', title: 'Ett riktigt gott skratt',
    image: '/images/comedy.jpg', imageAlt: 'En mikrofon i scenljus, redo för kvällens framträdande',
    date: '2026-09-25', time: '20:00–22:00', venue: 'Stand-up Göteborg', city: 'Göteborg',
    distanceKm: 1.2, price: 195, category: 'Stand-up', moods: ['Skratta', 'Hänga'],
    ageRestriction: 18, available: true,
    description: 'Lämna veckan vid dörren. En intim stand-up-kväll med nya röster, skarpa observationer och gott om skratt.',
  },
  {
    id: 'pustervik', slug: 'indie-hearts-club', title: 'Indie hearts club',
    image: '/images/indie.jpg', imageAlt: 'En utomhusscen och en stor publik i kvällsljus',
    date: '2026-09-26', time: '21:00–02:00', venue: 'Pustervik', city: 'Göteborg',
    distanceKm: 2.8, price: 250, category: 'Livemusik', moods: ['Livemusik', 'Dansa'],
    ageRestriction: 20, available: true,
    description: 'Gitarrer, nya upptäckter och låtar du kan utantill. En kärleksförklaring till indiemusiken mitt i Göteborg.',
  },
  {
    id: 'takbaren', slug: 'above-the-city', title: 'Above the city',
    image: '/images/bar.jpg', imageAlt: 'En stämningsfull bar med varma lampor och dukade bord',
    date: '2026-09-26', time: '17:00–23:00', venue: 'Takbaren', city: 'Göteborg',
    distanceKm: 0.8, price: 0, category: 'Bar & häng', moods: ['Hänga'],
    ageRestriction: 20, available: true,
    description: 'En avslappnad kväll, sköna DJ-set och tid att faktiskt prata med varandra. Kom tidigt och stanna en stund till.',
  },
  {
    id: 'oceanen', slug: 'soul-on-a-saturday', title: 'Soul on a Saturday',
    image: '/images/jazz.jpg', imageAlt: 'Närbild på en musiker som spelar trumpet i varmt ljus',
    date: '2026-09-26', time: '19:30–00:00', venue: 'Oceanen', city: 'Göteborg',
    distanceKm: 4.2, price: 220, category: 'Livemusik', moods: ['Livemusik', 'Hänga'],
    ageRestriction: 18, available: true,
    description: 'Varm soul och nära till scenen. Låt lördagen ta sin tid med levande musik och skönt häng i Majorna.',
  },
];
