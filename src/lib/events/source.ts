import type { Event, EventSourceId } from '@/types/event';

/**
 * Outcome of asking one source for events. A failing source must never take the page down:
 * the catalog reports it here and carries on with the others.
 */
export type SourceResult = {
  source: EventSourceId;
  /** `not-configured` = no API key; `error` = the call or the response failed. */
  status: 'ok' | 'not-configured' | 'error';
  events: Event[];
  /** Safe to show/log: never contains URLs with keys. */
  message?: string;
};

/** Anything that can supply events in the app's one normalized shape. */
export type EventSource = {
  id: EventSourceId;
  load: (now: Date) => Promise<SourceResult>;
};

/** How long fetched upstream data may be reused before a refresh picks up changes. */
export const SOURCE_REVALIDATE_SECONDS = 600;

const SOURCE_IDS: readonly EventSourceId[] = ['demo', 'ticketmaster', 'goteborgco'];

/** `EVENT_SOURCES=ticketmaster,demo` picks sources; real ones by default, demo only as a fallback. */
export function enabledSources(env: string | undefined = process.env.EVENT_SOURCES): EventSourceId[] {
  const requested = (env ?? 'ticketmaster,goteborgco').split(',').map(part => part.trim());
  return requested.filter((id): id is EventSourceId => (SOURCE_IDS as readonly string[]).includes(id));
}
