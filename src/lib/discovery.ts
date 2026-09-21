import type { Event, EventCategory } from '@/types/event';

export type DiscoveryFilters = {
  query: string;
  category: EventCategory | 'Alla event';
  date: string;
  freeOnly: boolean;
};

export function filterEvents(events: Event[], filters: DiscoveryFilters): Event[] {
  const query = filters.query.trim().toLocaleLowerCase('sv-SE');
  return events.filter(event =>
    event.available &&
    (filters.category === 'Alla event' || event.category === filters.category) &&
    (filters.date === 'all' || event.date === filters.date) &&
    (!filters.freeOnly || event.price === 0) &&
    `${event.title} ${event.venue} ${event.category} ${event.city}`.toLocaleLowerCase('sv-SE').includes(query),
  );
}
