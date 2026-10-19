import type { Event } from '@/types/event';

/** What a demo listing declares; `getEvents` adds the source fields every `Event` carries. */
type EventTemplate = Omit<Event, 'source' | 'externalId' | 'ticketUrl'>;

/**
 * Fictional prototype listings: the `demo` event source (src/lib/events/sources/demo.ts).
 * Photos illustrate atmosphere, not the named venues. Real events come from the other sources.
 */
export const eventTemplates: EventTemplate[] = [
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


const weeklyTitles = [
  ['Sunday disco', 'Söndagssoul', 'Söndagsskratt', 'Söndagshäng'],
  ['Monday grooves', 'Akustisk måndag', 'Måndag på micken', 'Quiz & kompisar'],
  ['Tisdag på dansgolvet', 'Jazz på tisdag', 'Nya röster', 'Spelkväll'],
  ['Disco mitt i veckan', 'Onsdag unplugged', 'Lillördag med skratt', 'Vinyl & vänner'],
  ['Thursday house', 'Torsdagsjam', 'Torsdagskomik', 'After work vid vattnet'],
  ['Friday fever', 'Fredag live', 'Fredagens skrattfest', 'Fredag med vänner'],
  ['Saturday beats', 'Lördag med soul', 'Lördag på scen', 'Lördagslounge'],
];
const weekdays = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const categorySeeds = [eventTemplates[0], eventTemplates[1], eventTemplates[2], eventTemplates[4]];

// Four additional fictional weekly series per day, with free and paid options.
weeklyTitles.forEach((titles, weekday) => {
  titles.forEach((title, categoryIndex) => {
    const seed = categorySeeds[categoryIndex];
    eventTemplates.push({
      ...seed,
      id: `weekly-${weekday}-${categoryIndex}`,
      slug: `weekly-${weekday}-${categoryIndex}`,
      title,
      date: `2026-09-${String(20 + weekday).padStart(2, '0')}`,
      time: ['22:00–03:00', '19:00–22:00', '20:00–22:00', '17:00–23:00'][categoryIndex],
      price: categoryIndex === 3 || (weekday + categoryIndex) % 3 === 0 ? 0 : [120, 150, 95, 0][categoryIndex],
      distanceKm: [0.8, 1.5, 2.5, 4][(weekday + categoryIndex) % 4],
      ageRestriction: 18,
      description: `${title} varje ${weekdays[weekday]}. ${seed.description}`,
    });
  });
});

/** Next weekly occurrence, evaluated at use time rather than at build/module load. */
export function getEvents(now = new Date()): Event[] {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)!.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const clock = `${part('hour')}:${part('minute')}:${part('second')}`;
  const base = new Date(`${today}T12:00:00Z`);
  return eventTemplates.map(event => {
    const weekday = new Date(`${event.date}T12:00:00Z`).getUTCDay();
    let days = (weekday - base.getUTCDay() + 7) % 7;
    if (days === 0 && `${event.time.slice(0, 5)}:00` <= clock) days = 7;
    const next = new Date(base);
    next.setUTCDate(next.getUTCDate() + days);
    return {
      ...event,
      source: 'demo' as const,
      externalId: event.id,
      ticketUrl: null,
      date: next.toISOString().slice(0, 10),
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
}
