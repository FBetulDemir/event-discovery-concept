import assert from 'node:assert/strict';
import test from 'node:test';
import { toSnapshot } from './snapshot.ts';
import { eventTemplates } from '../../data/events.ts';

const event = { ...eventTemplates[0], source: 'demo', externalId: 'yaki-da', ticketUrl: null };

test('a snapshot keeps the fields the plan UI renders and nothing else', () => {
  const snapshot = toSnapshot({ ...event, moods: ['Dansa'], ageRestriction: 18, available: true, slug: 'x' });
  assert.equal(snapshot.id, 'yaki-da');
  assert.equal(snapshot.title, event.title);
  for (const key of ['moods', 'ageRestriction', 'available', 'slug']) assert.ok(!(key in snapshot), key);
});

test('long descriptions are trimmed and every snapshot fits the database size limit', () => {
  const snapshot = toSnapshot({ ...event, description: 'å'.repeat(5000), title: 'T'.repeat(200) });
  assert.ok(snapshot.description.length <= 280);
  assert.ok(Buffer.byteLength(JSON.stringify(snapshot)) < 4000);
});
