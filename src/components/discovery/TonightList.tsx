'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { todayInGothenburg } from '@/lib/dates';
import { formatPrice, formatWhen } from '@/lib/format';
import { useHomeCatalog } from './CatalogProvider';
import { useNow } from './useNow';

const shortDay = (date: string) =>
  new Intl.DateTimeFormat('sv-SE', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)).replaceAll('.', '');

/** The next evening with events, as a schedule: when, what and where, what it costs. */
export function TonightList() {
  const { listed: events } = useHomeCatalog();
  const now = useNow();
  const today = now ? todayInGothenburg(new Date(now)) : null;

  const upcoming = events.filter(event => !today || event.date >= today);
  const first = upcoming[0]?.date;
  // One evening if it has enough on it; otherwise carry on into the next days so the list is never a single row.
  const sameDay = upcoming.filter(event => event.date === first);
  const rows = (sameDay.length >= 5 ? sameDay : upcoming).slice(0, 8);
  const isToday = first !== undefined && first === today;
  const label = today && first ? formatWhen(first, today) : 'Ikväll';
  const heading = !today || (isToday && sameDay.length >= 5) ? 'Det händer ikväll' : isToday ? 'Det händer snart' : label === 'Imorgon' ? 'Det händer imorgon' : /^\d/.test(label) ? `Det händer ${label}` : `Det händer ${label}`;
  const lead = rows[0];

  return (
    <section className="section tonight" aria-labelledby="tonight-title">
      <div className="page tonight__inner">
        <h2 id="tonight-title" className="head tonight__title" data-reveal>{heading}</h2>
        {rows.length === 0 ? (
          <p className="tonight__empty muted">Inget på listan just nu. Titta på alla event längre ner.</p>
        ) : (
          <>
            {lead && (
              <figure className="tonight__photo" data-reveal>
                <img src={lead.image} alt={lead.imageAlt} width={640} height={800} loading="lazy" />
              </figure>
            )}
            <ul className="schedule" aria-label="Kvällens event">
              {rows.map((event, index) => (
                <li key={event.id} data-reveal style={{ '--i': index } as React.CSSProperties}>
                  <Link href={`/events/${encodeURIComponent(event.id)}`} className="schedule__row">
                    <span className="schedule__when">
                      <span className="schedule__day muted">{shortDay(event.date)}</span>
                      <time className="schedule__time" dateTime={event.date}>{event.time.slice(0, 5)}</time>
                    </span>
                    <span className="schedule__what">
                      <span className="schedule__title">{event.title}</span>
                      <span className="muted">{event.venue}, {event.city}</span>
                    </span>
                    <span className="schedule__price">{formatPrice(event.price)}</span>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
