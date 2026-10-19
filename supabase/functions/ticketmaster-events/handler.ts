const ENDPOINT = 'https://app.ticketmaster.com/discovery/v2/events.json';
const HORIZON_DAYS = 90;

type Config = {
  ticketmasterKey: string | undefined;
  publishableKeys: string[];
  fetcher?: typeof fetch;
};

const utcStamp = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

/** Keep the upstream query fixed, so a caller cannot use the function as a general Ticketmaster proxy. */
export async function handleRequest(request: Request, { ticketmasterKey, publishableKeys, fetcher = fetch }: Config): Promise<Response> {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  const callerKey = request.headers.get('apikey');
  if (!callerKey || !publishableKeys.includes(callerKey)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ticketmasterKey) return Response.json({ error: 'Ticketmaster is not configured' }, { status: 503 });

  const start = new URL(request.url).searchParams.get('start');
  if (!start || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(start)) {
    return Response.json({ error: 'Invalid start time' }, { status: 400 });
  }
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return Response.json({ error: 'Invalid start time' }, { status: 400 });

  const params = new URLSearchParams({
    apikey: ticketmasterKey,
    countryCode: 'SE',
    latlong: '57.7066,11.9695',
    radius: '40',
    unit: 'km',
    classificationName: 'Music,Comedy',
    sort: 'date,asc',
    size: '200',
    locale: '*',
    startDateTime: start,
    endDateTime: utcStamp(new Date(startDate.getTime() + HORIZON_DAYS * 86_400_000)),
  });

  try {
    const upstream = await fetcher(`${ENDPOINT}?${params}`);
    if (!upstream.ok) return Response.json({ error: `Upstream HTTP ${upstream.status}` }, { status: 502 });
    const body = await upstream.json() as { _embedded?: { events?: unknown[] } };
    return Response.json({ _embedded: { events: body._embedded?.events ?? [] } });
  } catch {
    // Upstream errors can include request URLs with the API key. Never return or log them.
    return Response.json({ error: 'Upstream request failed' }, { status: 502 });
  }
}
