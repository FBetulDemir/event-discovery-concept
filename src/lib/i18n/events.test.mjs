import assert from 'node:assert/strict';
import test from 'node:test';
import { getEvents } from '../../data/events.ts';
import { localizeEvent } from './events.ts';
import { translatorFor } from '../../i18n/testing.mjs';

const events = getEvents(new Date('2026-10-18T10:00:00Z'));

test('every demo listing has an English title, description and image text', () => {
  const en = translatorFor('en');
  for (const event of events) {
    const local = localizeEvent(event, en);
    assert.ok(local.title && local.description && local.imageAlt, event.id);
    assert.ok(!/[åäö]/i.test(`${local.description} ${local.imageAlt}`.replace(/Trädgår’n|Göteborg|Majorna/g, '')), `${event.id} still Swedish`);
  }
});

test('weekly series name the weekday in the description', () => {
  const en = translatorFor('en');
  const sunday = events.find(event => event.id === 'weekly-0-1');
  assert.match(localizeEvent(sunday, en).description, /^Sunday soul every Sunday\. /);
  assert.match(localizeEvent(sunday, translatorFor('sv')).description, /^Söndagssoul varje söndag\. /);
});

test('real events are never touched', () => {
  const real = { ...events[0], source: 'ticketmaster', id: 'tm-1', title: 'Seller title', description: 'Seller words' };
  assert.equal(localizeEvent(real, translatorFor('en')), real);
});

test('the Swedish overlay reproduces the source data', () => {
  const sv = translatorFor('sv');
  for (const event of events) {
    const local = localizeEvent(event, sv);
    assert.equal(local.title, event.title, event.id);
    assert.equal(local.description, event.description, event.id);
    assert.equal(local.imageAlt, event.imageAlt, event.id);
  }
});
