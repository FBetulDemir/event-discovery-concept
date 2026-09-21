import { ChevronDown } from 'lucide-react';
import type { Event } from '@/types/event';
import { EventMeta } from './EventMeta';

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
});

export function EventCard({ event }: { event: Event }) {
  return (
    <article className="event-card">
      <div className="event-image">
        <img src={event.image} alt={event.imageAlt} width={900} height={600} loading="lazy" />
        <span className="event-category">{event.category}</span>
        <time className="event-date" dateTime={event.date}>
          {dateFormatter.format(new Date(`${event.date}T12:00:00Z`)).replaceAll('.', '')}
        </time>
      </div>
      <div className="event-body">
        <div className="event-topline"><span>{event.distanceKm.toLocaleString('sv-SE')} km från centrum</span><span>{event.price ? `${event.price} kr` : 'Fri entré'}</span></div>
        <h3>{event.title}</h3>
        <EventMeta event={event} />
        <details className="event-details">
          <summary>Om eventet<span className="sr-only">: {event.title}</span><ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="event-description"><p>{event.description}</p><p>{event.ageRestriction}+ · {event.city}</p></div>
        </details>
      </div>
    </article>
  );
}
