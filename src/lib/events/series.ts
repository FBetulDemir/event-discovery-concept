import type { Event } from '@/types/event';

/** A show that repeats (a residency, a tour leg) is one thing to choose, not twelve cards. */
const keyOf = (event: Event) => `${event.source}|${event.venue.toLowerCase()}|${event.title.toLowerCase().replace(/\s+/g, ' ').trim()}`;

/**
 * Keeps the earliest occurrence of every series and lists the others on it as `moreDates`.
 * Input order is preserved for the survivors. Nothing is dropped from the catalogue itself: the
 * event page and plans still reach every date by its own id.
 */
export function groupSeries(events: readonly Event[]): Event[] {
  const firstOfSeries = new Map<string, Event>();
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  for (const event of ordered) {
    const key = keyOf(event);
    const head = firstOfSeries.get(key);
    if (!head) firstOfSeries.set(key, { ...event, moreDates: [] });
    else head.moreDates!.push({ id: event.id, date: event.date, time: event.time });
  }
  const heads = new Set([...firstOfSeries.values()].map(event => event.id));
  return events.filter(event => heads.has(event.id)).map(event => firstOfSeries.get(keyOf(event))!)
    .map(event => (event.moreDates!.length ? event : { ...event, moreDates: undefined }));
}

/** Other dates of the same show as `event`, from the full list (for the event page). */
export function otherDates(event: Event, all: readonly Event[]): { id: string; date: string; time: string }[] {
  const key = keyOf(event);
  return all
    .filter(candidate => candidate.id !== event.id && keyOf(candidate) === key && `${candidate.date} ${candidate.time}` > `${event.date} ${event.time}`)
    .map(({ id, date, time }) => ({ id, date, time }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}
