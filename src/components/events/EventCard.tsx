import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown, Users } from 'lucide-react';
import type { Event } from '@/types/event';
import { EventMeta } from './EventMeta';
import { MatchReasons } from './MatchReasons';

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
});

type EventCardProps = {
  event: Event;
  recommendation?: { reasons: readonly string[]; rank: number };
};

export function EventCard({ event, recommendation }: EventCardProps) {
  const featured = recommendation?.rank === 1;
  return (
    <article className={`event-card${recommendation ? ' match-card' : ''}${featured ? ' match-card--featured' : ''}`} aria-labelledby={`event-title-${event.id}`}>
      <div className="event-image">
        <img src={event.image} alt={event.imageAlt} width={900} height={600} loading={featured ? 'eager' : 'lazy'} fetchPriority={featured ? 'high' : 'auto'} />
        {recommendation && <span className="match-rank" aria-label={`Rekommendation ${recommendation.rank}`}>{String(recommendation.rank).padStart(2, '0')}</span>}
        <span className="event-category">{event.category}</span>
        <time className="event-date" dateTime={event.date}>
          {dateFormatter.format(new Date(`${event.date}T12:00:00Z`)).replaceAll('.', '')}
        </time>
      </div>
      <div className="event-body">
        {recommendation && <div className="match-card__label"><span><Check size={14} aria-hidden="true" />Bra match</span>{featured && <span>DITT TOPPVAL</span>}</div>}
        <div className="event-topline"><span>{event.distanceKm.toLocaleString('sv-SE')} km från centrum</span><span>{event.price ? `${event.price} kr` : 'Fri entré'}</span></div>
        <h3 id={`event-title-${event.id}`}>{event.title}</h3>
        <EventMeta event={event} />
        {recommendation ? (
          <>
            <p className="match-card__description">{event.description}</p>
            <MatchReasons reasons={recommendation.reasons} />
            <div className="match-card__actions">
              <Link href={`/events/${event.id}`} className="match-event-link">Visa event<span className="sr-only">: {event.title}</span><ArrowUpRight size={17} aria-hidden="true" /></Link>
              <Link href={`/plan?event=${event.id}`} className="button button--primary"><Users size={17} aria-hidden="true" />Planera med vänner<span className="sr-only">: {event.title}</span></Link>
            </div>
          </>
        ) : <details className="event-details">
          <summary>Om eventet<span className="sr-only">: {event.title}</span><ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="event-description"><p>{event.description}</p><p>{event.ageRestriction}+ · {event.city}</p></div>
        </details>}
      </div>
    </article>
  );
}
