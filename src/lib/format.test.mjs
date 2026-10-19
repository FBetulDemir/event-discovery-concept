import assert from 'node:assert/strict';
import test from 'node:test';
import { formatWhen, formatPrice, formatPricePerPerson, formatAge, formatKm } from './format.ts';
import { translatorFor } from '../i18n/testing.mjs';

const sv = translatorFor('sv');
const en = translatorFor('en');

test('formatWhen: tonight, tomorrow, this week by weekday, later by date', () => {
  const today = '2026-10-18'; // a Sunday
  assert.equal(formatWhen('2026-10-18', today, 'sv', sv), 'Ikväll');
  assert.equal(formatWhen('2026-10-19', today, 'sv', sv), 'Imorgon');
  assert.equal(formatWhen('2026-10-23', today, 'sv', sv), 'fredag');
  assert.equal(formatWhen('2026-10-24', today, 'sv', sv), 'lördag');
  assert.equal(formatWhen('2026-10-25', today, 'sv', sv), '25 okt');
  assert.equal(formatWhen('2026-12-31', today, 'sv', sv), '31 dec');
});

test('formatWhen in English reads the same way', () => {
  const today = '2026-10-18';
  assert.equal(formatWhen('2026-10-18', today, 'en', en), 'Tonight');
  assert.equal(formatWhen('2026-10-19', today, 'en', en), 'Tomorrow');
  assert.equal(formatWhen('2026-10-23', today, 'en', en), 'Friday');
  assert.equal(formatWhen('2026-12-31', today, 'en', en), '31 Dec');
});

test('prices: unknown stays unknown, free is free, per person adds the unit', () => {
  assert.equal(formatPrice(null, sv), 'Pris ej angivet');
  assert.equal(formatPrice(0, sv), 'Fri entré');
  assert.equal(formatPrice(180, sv), '180 kr');
  assert.equal(formatPricePerPerson(180, sv), '180 kr / person');
  assert.equal(formatPricePerPerson(null, sv), 'Pris ej angivet');
  assert.equal(formatPrice(null, en), 'Price not stated');
  assert.equal(formatPrice(0, en), 'Free entry');
  assert.equal(formatPrice(180, en), '180 SEK');
  assert.equal(formatPricePerPerson(180, en), '180 SEK per person');
});

test('age limit and distance follow the language', () => {
  assert.equal(formatAge(null, sv), null);
  assert.equal(formatAge(18, sv), '18 år');
  assert.equal(formatAge(18, en), '18+');
  assert.equal(formatKm(1.8, 'sv'), '1,8');
  assert.equal(formatKm(1.8, 'en'), '1.8');
});
