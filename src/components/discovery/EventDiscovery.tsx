'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Search, X } from 'lucide-react';
import { filterEvents } from '@/lib/discovery';
import { formatDay } from '@/lib/dates';
import { categoryLabel } from '@/lib/i18n/labels';
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
  const t = useTranslations('home.browse');
  const all = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory | 'Alla event'>('Alla event');
  const [date, setDate] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const searchInput = useRef<HTMLInputElement>(null);

  const filtered = filterEvents(events, { query, category, date, freeOnly }, { locale, categoryLabel: value => categoryLabel(all, value) });
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
          <h2 id="browse-title" className="head">{t('heading')}</h2>
          <p className="section-heading__aside muted" role="status" aria-live="polite" aria-atomic="true">{t('count', { count: filtered.length })}</p>
        </div>

        <div className="browse__controls">
          <div className="field browse__search">
            <label htmlFor="event-search">{t('searchLabel')}</label>
            <div className="browse__search-box">
              <Search size={20} aria-hidden="true" />
              <input ref={searchInput} id="event-search" type="search" value={query} onChange={event => change(setQuery)(event.target.value)} placeholder={t('searchPlaceholder')} autoComplete="off" aria-controls="event-results" />
              {query && <button type="button" className="browse__clear" onClick={() => { setQuery(''); searchInput.current?.focus(); }} aria-label={t('clearSearch')}><X size={18} aria-hidden="true" /></button>}
            </div>
          </div>
          <div className="field browse__date">
            <label htmlFor="event-date">{t('dayLabel')}</label>
            <select id="event-date" value={date} onChange={event => change(setDate)(event.target.value)} aria-controls="event-results">
              <option value="all">{t('allDays')}</option>
              {days.map(day => (
                <option key={day} value={day}>{formatDay(day, locale, { weekday: 'short', day: 'numeric', month: 'long' })}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="browse__chips" role="group" aria-label={t('filterGroup')}>
          {categories.map(value => <Chip key={value} selected={category === value} onClick={() => change(setCategory)(value)} aria-controls="event-results">{value === 'Alla event' ? all('categories.all') : categoryLabel(all, value)}</Chip>)}
          <Chip selected={freeOnly} onClick={() => change(setFreeOnly)(!freeOnly)} aria-controls="event-results">{freeOnly && <Check size={16} aria-hidden="true" />}{all('format.free')}</Chip>
        </div>

        <div id="event-results">
          {filtered.length ? (
            <>
              <EventGrid events={filtered.slice(0, visible)} />
              {filtered.length > visible && (
                <div className="browse__more">
                  <Button variant="secondary" onClick={() => setVisible(current => current + PAGE_SIZE)}>{t('showMore', { count: filtered.length - visible })}</Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title={t('emptyTitle')} action={hasFilters ? <Button variant="secondary" onClick={reset}>{t('reset')}</Button> : undefined}>
              {t('emptyBody')}
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}
