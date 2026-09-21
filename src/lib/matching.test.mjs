import assert from 'node:assert/strict';
import test from 'node:test';
import { matchEvents, filterCompatibleEvents } from './matching.ts';
import { events } from '../data/events.ts';

const preferences = {
  location: 'Göteborg', date: { mode: 'single', start: '2026-09-25' },
  distance: 5, moods: ['Dansa'], budget: 300,
};
const now = { now: '2026-09-25T15:00:00Z' }; // 17:00 in Göteborg.
const fixture = (id, patch = {}) => ({ ...events[0], id, price: 200, distanceKm: 2, moods: [], category: 'Bar & häng', time: '19:00–23:00', ...patch });
const ids = results => results.map(result => result.event.id);

test('hard filters exclude incompatible listings before ranking, regardless of mood relevance', () => {
  const candidates = [
    fixture('valid'), fixture('unavailable', { available: false }),
    fixture('other-city', { city: 'Stockholm' }), fixture('wrong-date', { date: '2026-09-26' }),
    fixture('over-budget', { price: 301 }), fixture('too-far', { distanceKm: 5.1 }),
    fixture('started', { time: '16:00–23:00' }),
  ];
  assert.deepEqual(ids(matchEvents(candidates, preferences, now)), ['valid']);
});

test('city comparison ignores case, whitespace and Unicode composition; hard limits are inclusive', () => {
  const candidate = fixture('boundary', { city: 'GÖTEBORG', price: 300, distanceKm: 5 });
  assert.equal(filterCompatibleEvents([candidate], { ...preferences, location: ' göteborg ' }).length, 1);
});

test('free-only, unlimited budget, and zero-distance preferences remain distinct', () => {
  const candidates = [fixture('free', { price: 0, distanceKm: 0 }), fixture('paid', { price: 900 })];
  assert.deepEqual(ids(matchEvents(candidates, { ...preferences, budget: 0 })), ['free']);
  assert.equal(matchEvents(candidates, { ...preferences, budget: null }).length, 2);
  assert.deepEqual(ids(matchEvents(candidates, { ...preferences, budget: null, distance: 0 })), ['free']);
});

test('date ranges include endpoints and flexible dates accept the whole compatible catalogue', () => {
  const candidates = ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'].map(date => fixture(date, { date }));
  assert.deepEqual(ids(matchEvents(candidates, { ...preferences, date: { mode: 'range', start: '2026-09-25', end: '2026-09-26' } })), ['2026-09-25', '2026-09-26']);
  assert.equal(matchEvents(candidates, { ...preferences, date: { mode: 'flexible' } }).length, 4);
  assert.equal(matchEvents(candidates, { ...preferences, date: { mode: 'flexible' } }, now).length, 3);
});

test('incomplete/reversed ranges and malformed constraints produce no recommendations', () => {
  for (const date of [
    { mode: 'range', start: null, end: null },
    { mode: 'range', start: '2026-09-25', end: null },
    { mode: 'range', start: '2026-09-26', end: '2026-09-25' },
    { mode: 'single', start: '2026-02-30' },
  ]) assert.deepEqual(matchEvents(events, { ...preferences, date }), []);
  for (const patch of [{ budget: -1 }, { distance: NaN }, { location: ' ' }]) {
    assert.deepEqual(matchEvents(events, { ...preferences, ...patch }), []);
  }
});

test('invalid event dates, times, prices and distances cannot enter ranking', () => {
  const candidates = [
    fixture('date', { date: '2026-02-30' }), fixture('time', { time: '25:00–26:00' }),
    fixture('price', { price: -1 }), fixture('distance', { distanceKm: Infinity }),
  ];
  assert.deepEqual(matchEvents(candidates, { ...preferences, date: { mode: 'flexible' } }), []);
});

test('mood relevance outweighs small cost/distance advantages and category supplies missing mood tags', () => {
  const candidates = [fixture('cheap', { price: 0, distanceKm: 0 }), fixture('dance', { category: 'Klubb', price: 280, distanceKm: 4 })];
  const ranked = matchEvents(candidates, preferences, now);
  assert.equal(ranked[0].event.id, 'dance');
  assert.ok(ranked[0].reasons.includes('Matchar Dansa'));
  assert.ok(!ranked[1].reasons.some(reason => reason.startsWith('Matchar')));
});

test('multiple matched moods increase relevance and duplicate tags do not inflate it', () => {
  const candidates = [fixture('one', { moods: ['Dansa', 'Dansa'] }), fixture('both', { moods: ['Dansa', 'Skratta'] })];
  assert.deepEqual(ids(matchEvents(candidates, { ...preferences, moods: ['Dansa', 'Skratta'] })), ['both', 'one']);
  const reasons = matchEvents([fixture('dance', { category: 'Klubb', moods: ['Dansa', 'Dansa'] })], { ...preferences, moods: ['Dansa', 'Dansa'] })[0].reasons;
  assert.equal(reasons.filter(reason => reason === 'Matchar Dansa').length, 1);
});

test('sooner events rank higher when other factors are equal, including start time within a day', () => {
  const candidates = [fixture('later', { time: '22:00–03:00' }), fixture('sooner')];
  assert.deepEqual(ids(matchEvents(candidates, preferences, now)), ['sooner', 'later']);
  assert.deepEqual(ids(matchEvents([fixture('tomorrow', { date: '2026-09-26' }), fixture('today')], { ...preferences, date: { mode: 'flexible' } }, now)), ['today', 'tomorrow']);
});

test('budget and distance rank independently when remaining factors are equal', () => {
  assert.deepEqual(ids(matchEvents([fixture('expensive', { price: 290 }), fixture('affordable', { price: 100 })], preferences)), ['affordable', 'expensive']);
  assert.deepEqual(ids(matchEvents([fixture('far', { distanceKm: 4 }), fixture('near', { distanceKm: 1 })], preferences)), ['near', 'far']);
});

test('Swedish reasons reflect actual constraints without percentages or implicit budgets', () => {
  const result = matchEvents([fixture('dance', { category: 'Klubb', distanceKm: 1.8 })], preferences, now)[0];
  assert.deepEqual(result.reasons, ['Matchar Dansa', 'Inom din budget', '1,8 km bort', 'Ikväll']);
  assert.deepEqual(Object.keys(result).sort(), ['event', 'reasons']);
  assert.ok(result.reasons.every(reason => !reason.includes('%')));
  const unlimited = matchEvents([fixture('free', { price: 0 })], { ...preferences, budget: null })[0];
  assert.ok(unlimited.reasons.includes('Fri entré'));
  assert.ok(!unlimited.reasons.includes('Inom din budget'));
  assert.ok(!unlimited.reasons.includes('Ikväll'));
});

test('relative labels use Stockholm time, distinguish daytime, and do not label tomorrow as tonight', () => {
  assert.ok(matchEvents([fixture('day', { time: '15:00–17:00' })], preferences, { now: '2026-09-25T10:00:00Z' })[0].reasons.includes('Idag'));
  assert.ok(matchEvents([fixture('tomorrow', { date: '2026-09-26' })], { ...preferences, date: { mode: 'flexible' } }, now)[0].reasons.includes('Imorgon'));
  const midnight = { now: '2026-09-25T22:30:00Z' }; // Already September 26 locally.
  assert.ok(matchEvents([fixture('night', { date: '2026-09-26', time: '01:00–03:00' })], { ...preferences, date: { mode: 'flexible' } }, midnight)[0].reasons.includes('Idag'));
});

test('overnight events are dated by start and already-started events are excluded', () => {
  const candidates = [fixture('club', { time: '22:00–03:00' })];
  assert.equal(matchEvents(candidates, preferences, { now: '2026-09-25T19:00:00Z' }).length, 1);
  assert.equal(matchEvents(candidates, preferences, { now: '2026-09-25T21:00:00Z' }).length, 0);
});

test('exact ties are deterministic across input ordering; frozen inputs remain unchanged', () => {
  const candidates = [fixture('b'), fixture('a')];
  candidates.forEach(event => { Object.freeze(event.moods); Object.freeze(event); });
  Object.freeze(candidates);
  const prefs = Object.freeze({ ...preferences, moods: Object.freeze([]) });
  const before = JSON.stringify({ candidates, prefs });
  const ranked = matchEvents(candidates, prefs, now);
  assert.deepEqual(ids(ranked), ['a', 'b']);
  assert.deepEqual(ranked, matchEvents([...candidates].reverse(), prefs, now));
  assert.equal(JSON.stringify({ candidates, prefs }), before);
});

test('invalid reference clocks fail explicitly; empty input is supported', () => {
  assert.deepEqual(matchEvents([], preferences), []);
  assert.throws(() => matchEvents(events, preferences, { now: '2026-09-25T17:00:00' }), RangeError);
  assert.throws(() => matchEvents(events, preferences, { now: 'not-a-dateZ' }), RangeError);
});

test('real prototype data produces compatible recommendations and all eligible results remain available', () => {
  const all = matchEvents(events, { ...preferences, date: { mode: 'flexible' }, moods: [], budget: null, distance: 15 });
  assert.equal(all.length, 6);
  const matched = matchEvents(events, preferences, now);
  assert.equal(matched[0].event.id, 'yaki-da');
  assert.ok(matched.every(result => result.event.date === '2026-09-25' && result.event.price <= 300));
});
