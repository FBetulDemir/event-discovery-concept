import type { Event, EventCategory } from '@/types/event';
import type { Mood, Preferences } from '@/types/preferences';

export type Recommendation = {
  event: Event;
  reasons: string[];
};

export type MatchingOptions = {
  /** Explicit ISO instant with Z/offset. No clock is read inside the matching engine. */
  now?: string;
};

type ReferenceTime = { date: string; minute: number };

const categoryMoods: Record<EventCategory, readonly Mood[]> = {
  Klubb: ['Dansa'],
  Livemusik: ['Livemusik'],
  'Stand-up': ['Skratta'],
  'Bar & häng': ['Hänga'],
};

// Relative weights are ranking points, not confidence scores or percentages.
const weights = { mood: 60, time: 20, budget: 10, distance: 10 } as const;
const normalize = (value: string) => value.trim().normalize('NFC').toLocaleLowerCase('sv-SE');

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function startMinute(event: Event): number | null {
  const match = /^(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})$/.exec(event.time);
  if (!match) return null;
  const [, hours, minutes, endHours, endMinutes] = match.map(Number);
  if (hours > 23 || minutes > 59 || endHours > 23 || endMinutes > 59) return null;
  return hours * 60 + minutes;
}

/** A timezone-neutral index for comparing calendar dates and local start times. */
function minuteIndex(date: string, minute = 0): number {
  return Date.parse(`${date}T00:00:00Z`) / 60_000 + minute;
}

function referenceTime(options: MatchingOptions): ReferenceTime | undefined {
  if (options.now === undefined) return undefined;
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(options.now) || !Number.isFinite(Date.parse(options.now))) {
    throw new RangeError('MatchingOptions.now must be an ISO instant with a timezone.');
  }
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(options.now));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)!.value;
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    minute: Number(part('hour')) * 60 + Number(part('minute')) + Number(part('second')) / 60,
  };
}

function validPreferences(preferences: Preferences): boolean {
  if (!normalize(preferences.location) || !Number.isFinite(preferences.distance) || preferences.distance < 0) return false;
  if (preferences.budget !== null && (!Number.isFinite(preferences.budget) || preferences.budget < 0)) return false;
  const date = preferences.date;
  if (date.mode === 'flexible') return true;
  if (date.mode === 'single') return validDate(date.start);
  return date.start !== null && date.end !== null && validDate(date.start) && validDate(date.end) && date.start <= date.end;
}

function compatibleEvents(events: readonly Event[], preferences: Preferences, reference?: ReferenceTime): Event[] {
  if (!validPreferences(preferences)) return [];
  return events.filter(event => {
    if (!event.available || normalize(event.city) !== normalize(preferences.location)) return false;
    if (!Number.isFinite(event.price) || event.price < 0 || (preferences.budget !== null && event.price > preferences.budget)) return false;
    if (!Number.isFinite(event.distanceKm) || event.distanceKm < 0 || event.distanceKm > preferences.distance) return false;
    const start = startMinute(event);
    if (!validDate(event.date) || start === null) return false;
    // Only events that have not started are recommended when a reference time is supplied.
    if (reference && minuteIndex(event.date, start) < minuteIndex(reference.date, reference.minute)) return false;
    if (preferences.date.mode === 'single') return event.date === preferences.date.start;
    if (preferences.date.mode === 'range') return event.date >= preferences.date.start! && event.date <= preferences.date.end!;
    return true;
  });
}

/** Inclusive hard limits. Incomplete/invalid preferences return no events. Inputs are never mutated. */
export function filterCompatibleEvents(
  events: readonly Event[], preferences: Preferences, options: MatchingOptions = {},
): Event[] {
  return compatibleEvents(events, preferences, referenceTime(options));
}

function matchingMoods(event: Event, preferences: Preferences): Mood[] {
  const relevant = new Set([...event.moods, ...(categoryMoods[event.category] ?? [])].map(normalize));
  // A category and explicit mood describing the same interest count only once.
  return [...new Set(preferences.moods)].filter(mood => relevant.has(normalize(mood)));
}

function timeReason(event: Event, reference?: ReferenceTime): string {
  if (reference && event.date === reference.date) return startMinute(event)! >= 18 * 60 ? 'Ikväll' : 'Idag';
  if (reference && minuteIndex(event.date) - minuteIndex(reference.date) === 1_440) return 'Imorgon';
  const date = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${event.date}T12:00:00Z`));
  return `${date} kl. ${event.time.slice(0, 5)}`;
}

/**
 * Filters first, then ranks by mood/category (60), soonness (20), budget fit (10),
 * and proximity (10). Budget/distance points reward headroom within the user's limits.
 * No mood choices or budget cap means that factor is neutral.
 * Time favors sooner starts, measured from `now`, the selected start date, or the
 * earliest eligible event when dates are flexible. This never invents a time preference.
 * Exact ties resolve by start date/time, distance, price, then ID, independent of input order.
 * Returns every eligible result; the UI may take the first three. No scores are exposed.
 * Without `now`, past-event filtering and relative labels are intentionally unavailable.
 */
export function matchEvents(
  events: readonly Event[], preferences: Preferences, options: MatchingOptions = {},
): Recommendation[] {
  const reference = referenceTime(options);
  const eligible = compatibleEvents(events, preferences, reference);
  if (eligible.length === 0) return [];

  const anchor = reference
    ? minuteIndex(reference.date, reference.minute)
    : preferences.date.mode !== 'flexible'
      ? minuteIndex(preferences.date.start!)
      : Math.min(...eligible.map(event => minuteIndex(event.date, startMinute(event)!)));

  return eligible.map(event => {
    const moods = matchingMoods(event, preferences);
    const moodCount = new Set(preferences.moods).size;
    const start = minuteIndex(event.date, startMinute(event)!);
    const daysAway = Math.max(0, (start - anchor) / 1_440);
    const budgetFit = preferences.budget === null ? 0 : preferences.budget === 0 ? 1 : 1 - event.price / preferences.budget;
    const distanceFit = preferences.distance === 0 ? 1 : 1 - event.distanceKm / preferences.distance;
    const score = (moodCount ? moods.length / moodCount : 0) * weights.mood
      + weights.time / (1 + daysAway)
      + budgetFit * weights.budget
      + distanceFit * weights.distance;

    const reasons = moods.map(mood => `Matchar ${mood}`);
    if (preferences.budget !== null) reasons.push('Inom din budget');
    if (event.price === 0) reasons.push('Fri entré');
    reasons.push(`${event.distanceKm.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} km bort`);
    reasons.push(timeReason(event, reference));
    if (preferences.date.mode === 'range') reasons.push('Inom din valda period');

    return { event, reasons, score, start };
  }).sort((a, b) => b.score - a.score || a.start - b.start
    || a.event.distanceKm - b.event.distanceKm || a.event.price - b.event.price
    || (a.event.id < b.event.id ? -1 : a.event.id > b.event.id ? 1 : 0))
    .map(({ event, reasons }) => ({ event, reasons }));
}
