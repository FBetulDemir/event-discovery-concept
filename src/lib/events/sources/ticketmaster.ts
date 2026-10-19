import type { Event, EventCategory } from '@/types/event';
import { distanceKm, GOTEBORG_CENTRE } from '../geo.ts';
import { SOURCE_REVALIDATE_SECONDS, type EventSource, type SourceResult } from '../source.ts';

const ENDPOINT = 'https://app.ticketmaster.com/discovery/v2/events.json';
const HORIZON_DAYS = 90;

/** The subset of a Discovery API v2 event this adapter reads. Everything is optional on purpose. */
export type TicketmasterEvent = {
  id?: string;
  name?: string;
  url?: string;
  info?: string;
  pleaseNote?: string;
  images?: { url?: string; width?: number; ratio?: string }[];
  dates?: { start?: { localDate?: string; localTime?: string }; status?: { code?: string } };
  priceRanges?: { min?: number; currency?: string }[];
  classifications?: { segment?: { name?: string }; genre?: { name?: string } }[];
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
      location?: { latitude?: string; longitude?: string };
    }[];
  };
};

const CITY_ALIASES: Record<string, string> = { gothenburg: 'Göteborg', goteborg: 'Göteborg', göteborg: 'Göteborg' };

/** Only nightlife-shaped events are mapped; anything else (sport, theatre, …) is dropped, not guessed. */
function categoryFor(raw: TicketmasterEvent): { category: EventCategory; moods: string[] } | null {
  const classification = raw.classifications?.[0];
  const segment = classification?.segment?.name?.toLowerCase();
  const genre = classification?.genre?.name?.toLowerCase();
  if (genre === 'comedy') return { category: 'Stand-up', moods: ['Skratta'] };
  if (segment === 'music' && genre === 'dance/electronic') return { category: 'Klubb', moods: ['Dansa'] };
  if (segment === 'music') return { category: 'Livemusik', moods: ['Livemusik'] };
  return null;
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'event';
}

function bestImage(images: TicketmasterEvent['images']): string | null {
  const candidates = (images ?? []).filter(image => image.url);
  if (candidates.length === 0) return null;
  const wide = candidates.filter(image => image.ratio === '16_9' && (image.width ?? 0) >= 640);
  const pool = wide.length > 0 ? wide : candidates;
  return pool.reduce((best, image) => ((image.width ?? 0) > (best.width ?? 0) ? image : best)).url ?? null;
}

/**
 * Maps one Ticketmaster event to the app's `Event`, or `null` when it cannot be mapped honestly:
 * missing id/title/date/start time/coordinates, no image, or not a nightlife category.
 * Price is only taken when quoted in SEK; otherwise it stays unknown (`null`).
 */
export function normalizeTicketmasterEvent(raw: TicketmasterEvent): Event | null {
  const id = raw.id;
  const title = raw.name?.trim();
  const date = raw.dates?.start?.localDate;
  const localTime = raw.dates?.start?.localTime;
  const venue = raw._embedded?.venues?.[0];
  const latitude = Number(venue?.location?.latitude);
  const longitude = Number(venue?.location?.longitude);
  const image = bestImage(raw.images);
  const mapped = categoryFor(raw);

  if (!id || !title || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!localTime || !/^\d{2}:\d{2}/.test(localTime)) return null;
  if (!venue?.name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!image || !mapped) return null;

  const cityName = venue.city?.name?.trim() ?? '';
  const price = raw.priceRanges?.find(range => range.currency === 'SEK' && Number.isFinite(range.min))?.min ?? null;

  return {
    id: `tm-${id}`,
    source: 'ticketmaster',
    externalId: id,
    title,
    slug: slugify(title),
    image,
    imageAlt: title,
    date,
    time: localTime.slice(0, 5),
    venue: venue.name,
    city: CITY_ALIASES[cityName.toLowerCase()] ?? cityName,
    distanceKm: distanceKm(GOTEBORG_CENTRE, { lat: latitude, lng: longitude }),
    price,
    category: mapped.category,
    moods: mapped.moods,
    ageRestriction: null,
    available: !['cancelled', 'offsale', 'postponed'].includes(raw.dates?.status?.code ?? ''),
    description: cleanDescription(raw.info ?? raw.pleaseNote ?? ''),
    ticketUrl: raw.url ?? null,
  };
}

/** Sellers paste links and line noise into descriptions; keep the prose. */
export function cleanDescription(text: string): string {
  return text.replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}

const utcStamp = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

export const ticketmasterSource: EventSource = {
  id: 'ticketmaster',
  async load(now): Promise<SourceResult> {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) return { source: 'ticketmaster', status: 'not-configured', events: [], message: 'TICKETMASTER_API_KEY is not set' };

    const params = new URLSearchParams({
      apikey: apiKey,
      countryCode: 'SE',
      latlong: `${GOTEBORG_CENTRE.lat},${GOTEBORG_CENTRE.lng}`,
      radius: '40',
      unit: 'km',
      classificationName: 'Music,Comedy',
      sort: 'date,asc',
      size: '200',
      locale: '*',
      startDateTime: utcStamp(now),
      endDateTime: utcStamp(new Date(now.getTime() + HORIZON_DAYS * 86_400_000)),
    });

    try {
      const response = await fetch(`${ENDPOINT}?${params}`, { next: { revalidate: SOURCE_REVALIDATE_SECONDS } });
      // Never put the URL in a message: it carries the API key.
      if (!response.ok) return { source: 'ticketmaster', status: 'error', events: [], message: `HTTP ${response.status}` };
      const body = (await response.json()) as { _embedded?: { events?: TicketmasterEvent[] } };
      const events = (body._embedded?.events ?? [])
        .map(normalizeTicketmasterEvent)
        .filter((event): event is Event => event !== null);
      return { source: 'ticketmaster', status: 'ok', events };
    } catch (error) {
      return { source: 'ticketmaster', status: 'error', events: [], message: error instanceof Error ? error.name : 'Request failed' };
    }
  },
};
