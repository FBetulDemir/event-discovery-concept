import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTicketmasterEvent, ticketmasterSource } from './ticketmaster.ts';

// Shape follows the documented Discovery API v2 response; not yet verified against a live call.
const raw = (patch = {}) => ({
  id: 'Z7r9jZ1A7aaa',
  name: 'Club Night  ',
  url: 'https://www.ticketmaster.se/event/1',
  info: 'Doors at 22.',
  images: [
    { url: 'https://img/small.jpg', width: 305, ratio: '3_2' },
    { url: 'https://img/wide.jpg', width: 1024, ratio: '16_9' },
  ],
  dates: { start: { localDate: '2026-11-07', localTime: '22:00:00' }, status: { code: 'onsale' } },
  priceRanges: [{ min: 250, currency: 'SEK' }],
  classifications: [{ segment: { name: 'Music' }, genre: { name: 'Dance/Electronic' } }],
  _embedded: { venues: [{ name: 'Pustervik', city: { name: 'Gothenburg' }, location: { latitude: '57.7010', longitude: '11.9560' } }] },
  ...patch,
});

test('maps a club night to the app Event shape', () => {
  const event = normalizeTicketmasterEvent(raw());
  assert.equal(event.id, 'tm-Z7r9jZ1A7aaa');
  assert.equal(event.source, 'ticketmaster');
  assert.equal(event.externalId, 'Z7r9jZ1A7aaa');
  assert.equal(event.title, 'Club Night');
  assert.equal(event.image, 'https://img/wide.jpg');
  assert.equal(event.date, '2026-11-07');
  assert.equal(event.time, '22:00');
  assert.equal(event.city, 'Göteborg');
  assert.equal(event.category, 'Klubb');
  assert.equal(event.price, 250);
  assert.equal(event.available, true);
  assert.equal(event.ticketUrl, 'https://www.ticketmaster.se/event/1');
  assert.ok(event.distanceKm > 0 && event.distanceKm < 3);
});

test('categories: other music is live music, comedy is stand-up, anything else is dropped', () => {
  const live = raw({ classifications: [{ segment: { name: 'Music' }, genre: { name: 'Rock' } }] });
  const comedy = raw({ classifications: [{ segment: { name: 'Arts & Theatre' }, genre: { name: 'Comedy' } }] });
  const sport = raw({ classifications: [{ segment: { name: 'Sports' }, genre: { name: 'Football' } }] });
  assert.equal(normalizeTicketmasterEvent(live).category, 'Livemusik');
  assert.equal(normalizeTicketmasterEvent(comedy).category, 'Stand-up');
  assert.equal(normalizeTicketmasterEvent(sport), null);
});

test('price is only taken in SEK; otherwise it stays unknown rather than guessed or converted', () => {
  assert.equal(normalizeTicketmasterEvent(raw({ priceRanges: [{ min: 30, currency: 'EUR' }] })).price, null);
  assert.equal(normalizeTicketmasterEvent(raw({ priceRanges: undefined })).price, null);
  assert.equal(normalizeTicketmasterEvent(raw({ priceRanges: [{ min: 0, currency: 'SEK' }] })).price, 0);
});

test('events that cannot be mapped honestly are dropped, not filled with placeholders', () => {
  const noTime = raw({ dates: { start: { localDate: '2026-11-07' } } });
  const noCoords = raw({ _embedded: { venues: [{ name: 'X', city: { name: 'Göteborg' } }] } });
  const noImage = raw({ images: [] });
  const noId = raw({ id: undefined });
  for (const bad of [noTime, noCoords, noImage, noId]) assert.equal(normalizeTicketmasterEvent(bad), null);
});

test('cancelled, off-sale and postponed events are marked unavailable', () => {
  for (const code of ['cancelled', 'offsale', 'postponed']) {
    assert.equal(normalizeTicketmasterEvent(raw({ dates: { start: { localDate: '2026-11-07', localTime: '22:00:00' }, status: { code } } })).available, false, code);
  }
});

test('a missing end time is fine: the event keeps a start-only time', () => {
  assert.equal(normalizeTicketmasterEvent(raw()).time, '22:00');
});

test('descriptions lose pasted links but keep the prose', async () => {
  const { cleanDescription } = await import('./ticketmaster.ts');
  assert.equal(cleanDescription('Doors open 6 PM. Read more here: https://gotevent.se/en/phone-free-show/ Thanks'), 'Doors open 6 PM. Read more here: Thanks');
  assert.equal(cleanDescription('  Plain text.  '), 'Plain text.');
  assert.equal(normalizeTicketmasterEvent(raw({ info: 'Info https://x.se/a' })).description, 'Info');
});

test('the adapter calls the Supabase function without reading the local Ticketmaster key', async () => {
  const previous = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ticketmasterKey: process.env.TICKETMASTER_API_KEY,
  };
  const originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable';
  delete process.env.TICKETMASTER_API_KEY;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url.origin, 'https://example.supabase.co');
      assert.equal(url.pathname, '/functions/v1/ticketmaster-events');
      assert.equal(url.searchParams.get('start'), '2026-10-19T12:00:00Z');
      assert.equal(options.headers.apikey, 'publishable');
      return Response.json({ _embedded: { events: [raw()] } });
    };
    const result = await ticketmasterSource.load(new Date('2026-10-19T12:00:00Z'));
    assert.equal(result.status, 'ok');
    assert.equal(result.events[0].id, 'tm-Z7r9jZ1A7aaa');
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries({
      NEXT_PUBLIC_SUPABASE_URL: previous.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: previous.publishableKey,
      TICKETMASTER_API_KEY: previous.ticketmasterKey,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
