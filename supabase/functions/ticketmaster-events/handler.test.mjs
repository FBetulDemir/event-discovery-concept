import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest } from './handler.ts';

const start = '2026-10-19T12:00:00Z';
const request = (key = 'publishable', date = start) => new Request(`https://example.supabase.co/functions/v1/ticketmaster-events?start=${date}`, {
  headers: { apikey: key },
});

test('the proxy uses its secret for the fixed Göteborg query and returns only event data', async () => {
  let calledUrl;
  const response = await handleRequest(request(), {
    ticketmasterKey: 'private-ticketmaster-key',
    publishableKeys: ['publishable'],
    fetcher: async url => {
      calledUrl = new URL(url);
      return Response.json({ _embedded: { events: [{ id: 'one' }] }, requestUrl: url });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(calledUrl.origin, 'https://app.ticketmaster.com');
  assert.equal(calledUrl.searchParams.get('apikey'), 'private-ticketmaster-key');
  assert.equal(calledUrl.searchParams.get('latlong'), '57.7066,11.9695');
  assert.equal(calledUrl.searchParams.get('startDateTime'), start);
  assert.equal(calledUrl.searchParams.get('endDateTime'), '2027-01-17T12:00:00Z');
  assert.deepEqual(await response.json(), { _embedded: { events: [{ id: 'one' }] } });
});

test('unknown callers and invalid dates never reach Ticketmaster', async () => {
  let calls = 0;
  const config = {
    ticketmasterKey: 'private-ticketmaster-key',
    publishableKeys: ['publishable'],
    fetcher: async () => { calls += 1; return Response.json({}); },
  };
  assert.equal((await handleRequest(request('wrong'), config)).status, 401);
  assert.equal((await handleRequest(request('publishable', 'not-a-date'), config)).status, 400);
  assert.equal(calls, 0);
});

test('upstream failures cannot leak the secret through a response', async () => {
  const response = await handleRequest(request(), {
    ticketmasterKey: 'private-ticketmaster-key',
    publishableKeys: ['publishable'],
    fetcher: async () => { throw new Error('https://ticketmaster.test/?apikey=private-ticketmaster-key'); },
  });
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private-ticketmaster-key/);
});
