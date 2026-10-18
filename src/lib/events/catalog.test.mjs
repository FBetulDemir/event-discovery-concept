import assert from 'node:assert/strict';
import test from 'node:test';
import { enabledSources } from './source.ts';
import { distanceKm, GOTEBORG_CENTRE } from './geo.ts';

test('real sources are the default; unknown names are ignored; demo only when asked for', () => {
  assert.deepEqual(enabledSources(undefined), ['ticketmaster', 'goteborgco']);
  assert.deepEqual(enabledSources('ticketmaster, demo ,nonsense'), ['ticketmaster', 'demo']);
});

test('distance is measured from the city centre in kilometres, rounded to 0.1', () => {
  assert.equal(distanceKm(GOTEBORG_CENTRE, GOTEBORG_CENTRE), 0);
  const liseberg = distanceKm(GOTEBORG_CENTRE, { lat: 57.6955, lng: 11.9921 });
  assert.ok(liseberg > 1 && liseberg < 2.5, String(liseberg));
  const stockholm = distanceKm(GOTEBORG_CENTRE, { lat: 59.3293, lng: 18.0686 });
  assert.ok(stockholm > 390 && stockholm < 410, String(stockholm));
});
