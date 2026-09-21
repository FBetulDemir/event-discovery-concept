'use client';

import { useRef, useState } from 'react';
import { ArrowDown, AudioLines, CalendarDays, Check, Music2, Search, SlidersHorizontal, Smile, Wine, X } from 'lucide-react';
import { events } from '@/data/events';
import { filterEvents } from '@/lib/discovery';
import type { EventCategory } from '@/types/event';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EventGrid } from '@/components/events/EventGrid';

const categories = [
  { label: 'Alla event', icon: SlidersHorizontal },
  { label: 'Klubb', icon: AudioLines },
  { label: 'Livemusik', icon: Music2 },
  { label: 'Stand-up', icon: Smile },
  { label: 'Bar & häng', icon: Wine },
] as const;

export function EventDiscovery() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory | 'Alla event'>('Alla event');
  const [date, setDate] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const filtered = filterEvents(events, { query, category, date, freeOnly });
  const hasFilters = query !== '' || category !== 'Alla event' || date !== 'all' || freeOnly;
  function reset() {
    setQuery('');
    setCategory('Alla event');
    setDate('all');
    setFreeOnly(false);
    searchInput.current?.focus();
  }

  return (
    <section id="event-list" className="discovery-events" aria-labelledby="events-heading">
      <div className="search-row">
        <div className="search-field" role="search">
          <Search size={18} aria-hidden="true" />
          <label htmlFor="event-search" className="sr-only">Sök event eller ställe</label>
          <input ref={searchInput} id="event-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök event eller ställe…" autoComplete="off" aria-controls="event-results" />
          {query && <button type="button" className="clear-search" onClick={() => { setQuery(''); searchInput.current?.focus(); }} aria-label="Rensa sökning"><X size={18} aria-hidden="true" /></button>}
        </div>
        <div className="date-filter">
          <CalendarDays size={18} aria-hidden="true" />
          <label htmlFor="event-date" className="sr-only">Filtrera på datum</label>
          <select id="event-date" value={date} onChange={e => setDate(e.target.value)} aria-controls="event-results">
            <option value="all">Alla datum</option>
            <option value="2026-09-25">Fre 25 september</option>
            <option value="2026-09-26">Lör 26 september</option>
          </select>
        </div>
      </div>
      <div className="filter-row" role="group" aria-label="Filtrera event">
        {categories.map(({ label, icon: Icon }) => <Chip key={label} selected={category === label} onClick={() => setCategory(label)} aria-controls="event-results"><Icon size={16} aria-hidden="true" />{label}</Chip>)}
        <Chip selected={freeOnly} onClick={() => setFreeOnly(!freeOnly)} aria-controls="event-results">{freeOnly && <Check size={16} aria-hidden="true" />}Fri entré</Chip>
      </div>
      <SectionHeading id="events-heading" title={hasFilters ? 'Hitta din nästa kväll' : 'Värt att gå ut för'} eyebrow="UTVALT I GÖTEBORG">
        <span className="result-count" role="status" aria-live="polite" aria-atomic="true">{filtered.length} event <ArrowDown size={14} aria-hidden="true" /></span>
      </SectionHeading>
      <div id="event-results">
        {filtered.length ? <EventGrid events={filtered} /> : <div className="empty-state"><Search size={32} aria-hidden="true" /><h3>Ingen träff den här gången</h3><p>Testa ett annat sökord eller välj färre filter.</p><Button onClick={reset}>Visa alla event</Button></div>}
      </div>
      {hasFilters && filtered.length > 0 && <button type="button" className="reset-filters" onClick={reset}><X size={17} aria-hidden="true" />Rensa alla filter</button>}
    </section>
  );
}
