import type { Event } from '@/types/event';

/**
 * What a plan remembers about an event. Events live at their source; the plan keeps just enough
 * to keep showing the shortlist if the source later changes or drops the listing. It is a
 * reference copy of public listing metadata, shown as "as of when it was added".
 */
export type EventSnapshot = Pick<
  Event,
  'id' | 'source' | 'externalId' | 'title' | 'image' | 'imageAlt' | 'date' | 'time' | 'venue' | 'city'
  | 'category' | 'price' | 'distanceKm' | 'ticketUrl' | 'description'
>;

const MAX_DESCRIPTION = 280;

export function toSnapshot(event: Event): EventSnapshot {
  return {
    id: event.id,
    source: event.source,
    externalId: event.externalId,
    title: event.title,
    image: event.image,
    imageAlt: event.imageAlt,
    date: event.date,
    time: event.time,
    venue: event.venue,
    city: event.city,
    category: event.category,
    price: event.price,
    distanceKm: event.distanceKm,
    ticketUrl: event.ticketUrl,
    description: event.description.length > MAX_DESCRIPTION
      ? `${event.description.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…`
      : event.description,
  };
}
