import assert from 'node:assert/strict';
import test from 'node:test';
import { events } from '../data/events.ts';
import { filterEvents } from './discovery.ts';

const defaults = { query: '', category: 'Alla event', date: 'all', freeOnly: false };

test('unfiltered discovery shows all six available prototype events', () => {
  assert.equal(filterEvents(events, defaults).length, 6);
});

test('search finds Swedish venue names regardless of case and surrounding whitespace', () => {
  assert.deepEqual(filterEvents(events, { ...defaults, query: '  GÖTEBORG  ' }), events);
  assert.equal(filterEvents(events, { ...defaults, query: 'yaki-da' })[0].id, 'yaki-da');
});

test('category and date combine instead of overriding each other', () => {
  assert.deepEqual(filterEvents(events, { ...defaults, category: 'Livemusik', date: '2026-09-25' }).map(e => e.id), ['tradgarn']);
});

test('free entry works with other filters and permits an empty state', () => {
  assert.deepEqual(filterEvents(events, { ...defaults, freeOnly: true }).map(e => e.id), ['takbaren']);
  assert.equal(filterEvents(events, { ...defaults, freeOnly: true, category: 'Klubb' }).length, 0);
});

test('unavailable listings are excluded even when their title matches', () => {
  assert.equal(filterEvents([{ ...events[0], available: false }], { ...defaults, query: events[0].title }).length, 0);
});

test('an unmatched query produces no results and resetting restores listings', () => {
  assert.equal(filterEvents(events, { ...defaults, query: 'no-such-event' }).length, 0);
  assert.equal(filterEvents(events, defaults).length, 6);
});
