import assert from 'node:assert/strict';
import test from 'node:test';
import { addDays, addMonths, todayInGothenburg, monthDays, upcomingWeekend, selectDay, dateSelectionComplete, formatDateSelection } from './dates.ts';

test('calendar weeks begin on Monday and include every date once', () => {
  const days = monthDays('2026-09-01');
  assert.equal(days[0], null);
  assert.equal(days[1], '2026-09-01');
  assert.equal(days.filter(Boolean).length, 30);
  assert.equal(new Set(days.filter(Boolean)).size, 30);
  assert.equal(days.length % 7, 0);
});

test('month navigation clamps long months and handles leap years and year boundaries', () => {
  assert.equal(addMonths('2028-01-31', 1), '2028-02-29');
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2026-12-31', 1), '2027-01-31');
  assert.equal(monthDays('2028-02-01').filter(Boolean).length, 29);
});

test('date arithmetic and local today handle DST and Stockholm midnight', () => {
  assert.equal(addDays('2026-03-28', 1), '2026-03-29');
  assert.equal(addDays('2026-10-25', 1), '2026-10-26');
  assert.equal(todayInGothenburg(new Date('2026-09-21T22:30:00Z')), '2026-09-22');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('weekend shortcut never includes past days', () => {
  assert.deepEqual(upcomingWeekend('2026-09-21'), { mode: 'range', start: '2026-09-25', end: '2026-09-27' });
  assert.deepEqual(upcomingWeekend('2026-09-26'), { mode: 'range', start: '2026-09-26', end: '2026-09-27' });
  assert.deepEqual(upcomingWeekend('2026-09-27'), { mode: 'range', start: '2026-09-27', end: '2026-09-27' });
});

test('range selection requires two choices, orders reversed dates, and can cross months', () => {
  const empty = { mode: 'range', start: null, end: null };
  assert.equal(dateSelectionComplete(empty), false);
  const first = selectDay(empty, '2026-10-03');
  assert.equal(dateSelectionComplete(first), false);
  const range = selectDay(first, '2026-09-28');
  assert.deepEqual(range, { mode: 'range', start: '2026-09-28', end: '2026-10-03' });
  assert.equal(dateSelectionComplete(range), true);
  assert.deepEqual(selectDay(range, '2026-11-01'), { mode: 'range', start: '2026-11-01', end: null });
});

test('a same-day range is valid and flexible selection becomes a specific day on click', () => {
  assert.deepEqual(selectDay({ mode: 'range', start: '2026-09-25', end: null }, '2026-09-25'), { mode: 'range', start: '2026-09-25', end: '2026-09-25' });
  assert.deepEqual(selectDay({ mode: 'flexible' }, '2026-09-25'), { mode: 'single', start: '2026-09-25' });
  assert.equal(dateSelectionComplete({ mode: 'flexible' }), true);
});

test('summary describes flexible, incomplete, single, and range selections', () => {
  assert.equal(formatDateSelection({ mode: 'flexible' }), 'Flexibelt – alla datum');
  assert.equal(formatDateSelection({ mode: 'range', start: null, end: null }), 'Välj start- och slutdatum');
  assert.match(formatDateSelection({ mode: 'range', start: '2026-09-25', end: null }), /välj slutdatum/);
  assert.match(formatDateSelection({ mode: 'single', start: '2026-09-25' }), /25 sep.*2026/);
  assert.match(formatDateSelection({ mode: 'range', start: '2026-09-25', end: '2026-10-02' }), /25 sep.*2 okt/);
});
