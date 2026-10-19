import { handleRequest } from './handler.ts';

function publishableKeys(): string[] {
  const configured = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (configured) {
    try {
      return Object.values(JSON.parse(configured) as Record<string, string>);
    } catch {
      return [];
    }
  }
  const legacy = Deno.env.get('SUPABASE_ANON_KEY');
  return legacy ? [legacy] : [];
}

Deno.serve(request => handleRequest(request, {
  ticketmasterKey: Deno.env.get('TICKETMASTER_API_KEY'),
  publishableKeys: publishableKeys(),
}));
