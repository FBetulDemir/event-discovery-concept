import assert from 'node:assert/strict';
import test from 'node:test';
import { formatWhen, formatPrice, formatPricePerPerson } from './format.ts';

test('formatWhen: tonight, tomorrow, this week by weekday, later by date', () => {
  const today = '2026-10-18'; // a Sunday
  assert.equal(formatWhen('2026-10-18', today), 'Ikväll');
  assert.equal(formatWhen('2026-10-19', today), 'Imorgon');
  assert.equal(formatWhen('2026-10-23', today), 'fredag');
  assert.equal(formatWhen('2026-10-24', today), 'lördag');
  assert.equal(formatWhen('2026-10-25', today), '25 okt');
  assert.equal(formatWhen('2026-12-31', today), '31 dec');
});

test('prices: unknown stays unknown, free is free, per person adds the unit', () => {
  assert.equal(formatPrice(null), 'Pris ej angivet');
  assert.equal(formatPrice(0), 'Fri entré');
  assert.equal(formatPrice(180), '180 kr');
  assert.equal(formatPricePerPerson(180), '180 kr / person');
  assert.equal(formatPricePerPerson(null), 'Pris ej angivet');
});
