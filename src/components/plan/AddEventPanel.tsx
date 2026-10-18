'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCatalog } from '@/lib/useEvents';
import { groupSeries } from '@/lib/events/series';
import { formatPlanDate } from '@/lib/plans/dates';
import type { Event } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

type Props = { existing: ReadonlySet<string>; busy: boolean; onAdd: (event: Event) => void };

/** Add another option to the plan without leaving it: search the catalogue, one tap to add. */
export function AddEventPanel({ existing, busy, onAdd }: Props) {
  const { events, loading } = useCatalog();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('sv-SE');
    return groupSeries(events)
      .filter(event => !existing.has(event.id))
      .filter(event => !needle || `${event.title} ${event.venue} ${event.category}`.toLocaleLowerCase('sv-SE').includes(needle))
      .slice(0, 6);
  }, [events, existing, query]);

  return (
    <details className="add-event">
      <summary className="btn btn--secondary"><Plus size={18} aria-hidden="true" />Lägg till event</summary>
      <div className="add-event__body">
        <Field label="Sök event eller ställe" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Till exempel Park Lane" autoComplete="off" />
        {loading ? <p className="muted" role="status">Hämtar event…</p> : results.length === 0 ? (
          <p className="muted">Inget som matchar.</p>
        ) : (
          <ul className="add-event__list">
            {results.map(event => (
              <li key={event.id}>
                <img src={event.image} alt="" width={64} height={80} loading="lazy" />
                <span className="add-event__copy">
                  <span className="add-event__title">{event.title}</span>
                  <span className="muted small">{event.venue}, {formatPlanDate(event.date, true)} {event.time.slice(0, 5)}</span>
                </span>
                <Button variant="secondary" disabled={busy} onClick={() => onAdd(event)}>Lägg till<span className="sr-only">: {event.title}</span></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
