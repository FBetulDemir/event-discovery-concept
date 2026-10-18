import type { Event } from '@/types/event';
import type { Translator } from './locale.ts';

// Which base listing each weekly series was copied from (src/data/events.ts `categorySeeds`).
const SEED_IDS = ['yaki-da', 'tradgarn', 'standup', 'takbaren'] as const;

/**
 * The fictional demo listings are written in Swedish; this shows them in the visitor's language
 * through the `demoEvents.*` messages. Real events (Ticketmaster, later Göteborg & Co) are never
 * touched: they are shown exactly as the seller wrote them. `t` is the root translator.
 */
export function localizeEvent(event: Event, t: Translator): Event {
  if (event.source !== 'demo') return event;
  const base = `demoEvents.base.${event.id}`;
  if (t.has?.(`${base}.title`)) {
    return { ...event, title: t(`${base}.title`), imageAlt: t(`${base}.imageAlt`), description: t(`${base}.description`) };
  }
  const weekly = /^weekly-(\d)-(\d)$/.exec(event.id);
  const seed = weekly ? `demoEvents.base.${SEED_IDS[Number(weekly[2])]}` : null;
  if (weekly && seed && t.has?.(`demoEvents.weekly.${weekly[1]}.${weekly[2]}`)) {
    const title = t(`demoEvents.weekly.${weekly[1]}.${weekly[2]}`);
    return {
      ...event,
      title,
      imageAlt: t(`${seed}.imageAlt`),
      description: t('demoEvents.weeklyDescription', { title, weekday: t(`demoEvents.weekdays.${weekly[1]}`), description: t(`${seed}.description`) }),
    };
  }
  return event;
}

export const localizeEvents = (events: Event[], t: Translator): Event[] => events.map(event => localizeEvent(event, t));
