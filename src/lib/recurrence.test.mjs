import assert from 'node:assert/strict';
import test from 'node:test';
import { getEvents } from '../data/events.ts';
import { matchEvents } from './matching.ts';

test('weekly catalogue stays eligible across future years and Stockholm DST changes', () => {
  for (const now of ['2026-10-11T12:00:00Z', '2026-10-25T01:30:00Z', '2027-03-28T01:30:00Z', '2035-12-31T23:30:00Z']) {
    const events = getEvents(new Date(now));
    assert.equal(events.length, 34);
    assert.equal(new Set(events.map(e => e.id)).size, 34);
    assert.equal(new Set(events.map(e => new Date(`${e.date}T12:00:00Z`).getUTCDay())).size, 7);
    const matches = matchEvents(events, {
      location: 'G\u00f6teborg', distance: 15, budget: null, moods: [], date: { mode: 'flexible' },
    }, { now });
    assert.equal(matches.length, 34);
    assert.ok(events.filter(e => e.price === 0).length >= 7);
  }
});

test('an event rolls to the following week at its Stockholm start time and keeps its ID', () => {
  const before = getEvents(new Date('2026-10-16T19:59:59Z')).find(e => e.id === 'yaki-da');
  const after = getEvents(new Date('2026-10-16T20:00:00Z')).find(e => e.id === 'yaki-da');
  assert.equal(before.date, '2026-10-16');
  assert.equal(after.date, '2026-10-23');
  assert.equal(before.id, after.id);
});
