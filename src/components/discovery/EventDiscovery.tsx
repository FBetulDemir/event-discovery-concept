'use client';

import { useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { filterEvents } from '@/lib/discovery';
import type { EventCategory } from '@/types/event';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventGrid } from '@/components/events/EventGrid';
import { useHomeCatalog } from './CatalogProvider';

const categories: ('Alla event' | EventCategory)[] = ['Alla event', 'Klubb', 'Livemusik', 'Stand-up', 'Bar & häng'];
const PAGE_SIZE = 12;

/** Browse everything: search, day, category, free entry. Search and filters combine (docs/CONTRACTS.md section 5). */
export function EventDiscovery() {
  const { listed: events } = useHomeCatalog();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory | 'Alla event'>('Alla event');
  const [date, setDate] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const searchInput = useRef<HTMLInputElement>(null);

  const filtered = filterEvents(events, { query, category, date, freeOnly });
  const hasFilters = query !== '' || category !== 'Alla event' || date !== 'all' || freeOnly;
  const days = [...new Set(events.map(event => event.date))];

  function reset() {
    setQuery(''); setCategory('Alla event'); setDate('all'); setFreeOnly(false); setVisible(PAGE_SIZE);
    searchInput.current?.focus();
  }
  const change = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setVisible(PAGE_SIZE); };

  return (
    <section id="event-list" className="section browse" aria-labelledby="browse-title">
      <div className="page">
        <div className="section-heading">
          <h2 id="browse-title" className="head">Alla event</h2>
          <p className="section-heading__aside muted" role="status" aria-live="polite" aria-atomic="true">{filtered.length} event</p>
        </div>

        <div className="browse__controls">
          <div className="field browse__search">
            <label htmlFor="event-search">Sök event eller ställe</label>
            <div className="browse__search-box">
              <Search size={20} aria-hidden="true" />
              <input ref={searchInput} id="event-search" type="search" value={query} onChange={event => change(setQuery)(event.target.value)} placeholder="Till exempel Scandinavium" autoComplete="off" aria-controls="event-results" />
              {query && <button type="button" className="browse__clear" onClick={() => { setQuery(''); searchInput.current?.focus(); }} aria-label="Rensa sökning"><X size={18} aria-hidden="true" /></button>}
            </div>
          </div>
          <div className="field browse__date">
            <label htmlFor="event-date">Dag</label>
            <select id="event-date" value={date} onChange={event => change(setDate)(event.target.value)} aria-controls="event-results">
              <option value="all">Alla dagar</option>
              {days.map(day => (
                <option key={day} value={day}>{new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`))}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="browse__chips" role="group" aria-label="Filtrera event">
          {categories.map(label => <Chip key={label} selected={category === label} onClick={() => change(setCategory)(label)} aria-controls="event-results">{label}</Chip>)}
          <Chip selected={freeOnly} onClick={() => change(setFreeOnly)(!freeOnly)} aria-controls="event-results">{freeOnly && <Check size={16} aria-hidden="true" />}Fri entré</Chip>
        </div>

        <div id="event-results">
          {filtered.length ? (
            <>
              <EventGrid events={filtered.slice(0, visible)} />
              {filtered.length > visible && (
                <div className="browse__more">
                  <Button variant="secondary" onClick={() => setVisible(current => current + PAGE_SIZE)}>Visa fler ({filtered.length - visible} kvar)</Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Ingen träff den här gången" action={hasFilters ? <Button variant="secondary" onClick={reset}>Rensa filter</Button> : undefined}>
              Testa ett annat sökord eller färre filter.
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}
