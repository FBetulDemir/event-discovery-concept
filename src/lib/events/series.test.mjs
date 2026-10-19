import assert from 'node:assert/strict';
import test from 'node:test';
import { groupSeries, otherDates } from './series.ts';

const ev = (id, patch = {}) => ({ id, source: 'ticketmaster', title: 'GLAMORAMA', venue: 'Park Lane', date: '2026-11-07', time: '18:30', ...patch });

test('a repeating show keeps its earliest date and lists the others', () => {
  const grouped = groupSeries([ev('c', { date: '2026-11-21' }), ev('a', { date: '2026-11-07' }), ev('b', { date: '2026-11-14' })]);
  assert.deepEqual(grouped.map(e => e.id), ['a']);
  assert.deepEqual(grouped[0].moreDates.map(d => d.id), ['b', 'c']);
});

test('different shows, venues or sources are never merged and single shows carry no moreDates', () => {
  const grouped = groupSeries([ev('a'), ev('b', { venue: 'Pustervik' }), ev('c', { title: 'Other' }), ev('d', { source: 'demo' })]);
  assert.equal(grouped.length, 4);
  assert.ok(grouped.every(e => e.moreDates === undefined));
});

test('titles match regardless of case and spacing; input order of survivors is kept', () => {
  const grouped = groupSeries([ev('x', { title: 'Show' }), ev('a', { title: 'Other', date: '2026-11-01' }), ev('y', { title: ' show ', date: '2026-12-01' })]);
  assert.deepEqual(grouped.map(e => e.id), ['x', 'a']);
  assert.equal(grouped[0].moreDates[0].id, 'y');
});

test('otherDates lists only later occurrences of the same show, oldest first', () => {
  const all = [ev('a', { date: '2026-11-07' }), ev('b', { date: '2026-11-21' }), ev('c', { date: '2026-11-14' }), ev('d', { venue: 'X' })];
  assert.deepEqual(otherDates(all[0], all).map(d => d.id), ['c', 'b']);
  assert.deepEqual(otherDates(all[1], all), []);
});
