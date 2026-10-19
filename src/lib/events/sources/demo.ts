import { getEvents } from '@/data/events';
import type { EventSource } from '../source';

/** Fictional weekly listings (src/data/events.ts). Used for development, tests and as a fallback. */
export const demoSource: EventSource = {
  id: 'demo',
  async load(now) {
    return { source: 'demo', status: 'ok', events: getEvents(now) };
  },
};
