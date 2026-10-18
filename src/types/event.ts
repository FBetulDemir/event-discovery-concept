export type EventCategory = 'Klubb' | 'Livemusik' | 'Stand-up' | 'Bar & häng';

/** Where an event came from. Also the CHECK constraint on plan_events.source. */
export type EventSourceId = 'demo' | 'ticketmaster' | 'goteborgco';

/**
 * The one shape every source adapter must produce (docs/CONTRACTS.md §1).
 * Adapters drop what they cannot map honestly instead of inventing values.
 */
export type Event = {
  /** Unique across sources and stable: demo ids as-is, external ones prefixed (`tm-…`, `gbg-…`). */
  id: string;
  source: EventSourceId;
  /** The source's own id; with `source` it identifies the event in plan_events. */
  externalId: string;
  title: string;
  slug: string;
  image: string;
  imageAlt: string;
  /** YYYY-MM-DD in Europe/Stockholm. */
  date: string;
  /** `HH:MM–HH:MM`, or just `HH:MM` when the source does not publish an end time. */
  time: string;
  venue: string;
  city: string;
  distanceKm: number;
  /** SEK per person. `null` = the source does not say; `0` = free. */
  price: number | null;
  category: EventCategory;
  moods: string[];
  /** `null` = unknown. */
  ageRestriction: number | null;
  available: boolean;
  description: string;
  /** Where to buy tickets / read more at the source. `null` for fictional demo events. */
  ticketUrl: string | null;
  /** Set on a series' first upcoming occurrence by `groupSeries`: the other dates of the same show. */
  moreDates?: { id: string; date: string; time: string }[];
};
