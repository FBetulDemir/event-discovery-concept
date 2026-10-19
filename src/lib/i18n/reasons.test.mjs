import assert from 'node:assert/strict';
import test from 'node:test';
import { describeReason, reasonKey } from './reasons.ts';
import { categoryLabel, moodLabel } from './labels.ts';
import { translatorFor } from '../../i18n/testing.mjs';

const all = [
  { kind: 'mood', mood: 'Skratta' },
  { kind: 'withinBudget' },
  { kind: 'free' },
  { kind: 'priceUnknown' },
  { kind: 'distance', km: 2.35 },
  { kind: 'when', when: 'tonight', date: '2026-09-25', time: '22:00' },
  { kind: 'when', when: 'today', date: '2026-09-25', time: '15:00' },
  { kind: 'when', when: 'tomorrow', date: '2026-09-26', time: '19:00' },
  { kind: 'when', when: 'date', date: '2026-12-31', time: '21:30' },
  { kind: 'inRange' },
];

test('every reason kind reads as a sentence in Swedish', () => {
  const sv = translatorFor('sv');
  assert.deepEqual(all.map(reason => describeReason(reason, sv, 'sv')), [
    'Matchar Skratta', 'Inom din budget', 'Fri entré', 'Pris ej angivet', '2,35 km bort',
    'Ikväll', 'Idag', 'Imorgon', '31 dec. 2026 kl. 21:30', 'Inom din valda period',
  ]);
});

test('every reason kind reads as a sentence in English', () => {
  const en = translatorFor('en');
  assert.deepEqual(all.map(reason => describeReason(reason, en, 'en')), [
    'Matches Laugh', 'Within your budget', 'Free entry', 'Price not stated', '2.35 km away',
    'Tonight', 'Today', 'Tomorrow', '31 Dec 2026 at 21:30', 'Within your chosen dates',
  ]);
});

test('reason keys are unique within one result', () => {
  const keys = all.filter(reason => reason.kind !== 'when').map(reasonKey);
  assert.equal(new Set(keys).size, keys.length);
  assert.notEqual(reasonKey({ kind: 'mood', mood: 'Dansa' }), reasonKey({ kind: 'mood', mood: 'Skratta' }));
});

test('categories and moods keep their Swedish identifiers and get display names', () => {
  const en = translatorFor('en');
  assert.equal(categoryLabel(en, 'Bar & häng'), 'Bar & hangout');
  assert.equal(moodLabel(en, 'Hänga'), 'Hang out');
  assert.equal(moodLabel(translatorFor('sv'), 'Hänga'), 'Hänga');
});
