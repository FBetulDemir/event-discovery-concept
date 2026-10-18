import type { Event, EventCategory } from '@/types/event';
import { intlLocale, type Locale } from './i18n/locale.ts';

export type DiscoveryFilters = {
  query: string;
  category: EventCategory | 'Alla event';
  date: string;
  freeOnly: boolean;
};

export type SearchOptions = {
  locale?: Locale;
  /** Display name of a category, so searching "club" finds a Klubb event in English. */
  categoryLabel?: (category: EventCategory) => string;
};

export function filterEvents(events: Event[], filters: DiscoveryFilters, options: SearchOptions = {}): Event[] {
  const tag = intlLocale(options.locale ?? 'sv');
  const query = filters.query.trim().toLocaleLowerCase(tag);
  return events.filter(event =>
    event.available &&
    (filters.category === 'Alla event' || event.category === filters.category) &&
    (filters.date === 'all' || event.date === filters.date) &&
    (!filters.freeOnly || event.price === 0) &&
    `${event.title} ${event.venue} ${event.category} ${options.categoryLabel?.(event.category) ?? ''} ${event.city}`.toLocaleLowerCase(tag).includes(query),
  );
}
