import type { DateSelection } from '@/types/preferences';

/** Calendar dates use UTC arithmetic, independent of DST or the browser timezone. */
export function parseDate(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

export function addMonths(value: string, months: number): string {
  const date = parseDate(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return isoDate(date);
}

export function todayInGothenburg(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function monthDays(month: string): (string | null)[] {
  const first = `${month.slice(0, 7)}-01`;
  const weekday = (parseDate(first).getUTCDay() + 6) % 7;
  const next = addMonths(first, 1);
  const count = parseDate(addDays(next, -1)).getUTCDate();
  const cells: (string | null)[] = Array(weekday).fill(null);
  for (let day = 0; day < count; day++) cells.push(addDays(first, day));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function upcomingWeekend(today: string): DateSelection {
  const weekday = parseDate(today).getUTCDay();
  // Friday–Sunday; if already in the weekend, keep only today and remaining days.
  const start = weekday === 0 || weekday >= 5 ? today : addDays(today, 5 - weekday);
  return { mode: 'range', start, end: addDays(start, (7 - parseDate(start).getUTCDay()) % 7) };
}

export function selectDay(selection: DateSelection, day: string): DateSelection {
  if (selection.mode !== 'range') return { mode: 'single', start: day };
  if (selection.start === null || selection.end !== null) return { mode: 'range', start: day, end: null };
  return { mode: 'range', start: day < selection.start ? day : selection.start, end: day < selection.start ? selection.start : day };
}

export function dateSelectionComplete(selection: DateSelection): boolean {
  return selection.mode !== 'range' || (selection.start !== null && selection.end !== null);
}

export function formatDateSelection(selection: DateSelection): string {
  if (selection.mode === 'flexible') return 'Flexibelt – alla datum';
  if (selection.start === null) return 'Välj start- och slutdatum';
  const format = (value: string) => new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(parseDate(value));
  if (selection.mode === 'single') return format(selection.start);
  if (!selection.end) return `${format(selection.start)} – välj slutdatum`;
  return selection.start === selection.end ? format(selection.start) : `${format(selection.start)} – ${format(selection.end)}`;
}
