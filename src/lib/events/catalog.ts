import type { Event, EventSourceId } from '@/types/event';
import { enabledSources, type EventSource, type SourceResult } from './source';
import { demoSource } from './sources/demo';
import { ticketmasterSource } from './sources/ticketmaster';

const sources: Record<EventSourceId, EventSource | undefined> = {
  demo: demoSource,
  ticketmaster: ticketmasterSource,
  goteborgco: undefined, // adapter lands once a Göteborg & Co subscription key is available
};

export type SourceStatus = Pick<SourceResult, 'source' | 'status' | 'message'> & { count: number };
export type Catalog = { events: Event[]; sources: SourceStatus[] };

/** Gänget is for a night out in Göteborg: anything further from the centre is left out of the catalogue. */
export const MAX_DISTANCE_KM = 20;

export const byStart = (a: Event, b: Event) =>
  a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.id.localeCompare(b.id);

/**
 * Merges every enabled source into one list. Sources run in parallel and fail independently.
 * If nothing real came back (no keys, outage) the fictional demo listings fill in, and say so
 * through `sources`, so the UI never presents invented events as real ones without a label.
 */
export async function loadCatalog(now = new Date(), ids: EventSourceId[] = enabledSources()): Promise<Catalog> {
  const results = await Promise.all(ids.map(async id => {
    const source = sources[id];
    if (!source) return { source: id, status: 'not-configured', events: [], message: 'No adapter yet' } satisfies SourceResult;
    return source.load(now);
  }));

  if (!results.some(result => result.events.length > 0) && !ids.includes('demo')) {
    results.push(await demoSource.load(now));
  }

  const seen = new Set<string>();
  const events = results.flatMap(result => result.events)
    .filter(event => event.distanceKm <= MAX_DISTANCE_KM)
    .filter(event => (seen.has(event.id) ? false : (seen.add(event.id), true)))
    .sort(byStart);

  return {
    events,
    sources: results.map(({ source, status, message, events: list }) => ({ source, status, message, count: list.length })),
  };
}

export async function findEvent(id: string, now = new Date()): Promise<Event | undefined> {
  return (await loadCatalog(now)).events.find(event => event.id === id);
}
