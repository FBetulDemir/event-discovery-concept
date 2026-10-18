import { ArrowUpRight, PartyPopper, Trophy } from 'lucide-react';
import type { EventSnapshot } from '@/lib/plans/snapshot';
import { formatPricePerPerson } from '@/lib/format';

/** The decided event. Tickets are bought at the source: we link out, we do not sell. */
export function WinnerCard({ event, votes }: { event: EventSnapshot; votes: number }) {
  const date = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`));
  return (
    <article className="result-card" aria-labelledby="winner-title">
      <img className="result-card__image" src={event.image} alt={event.imageAlt} width={900} height={600} />
      <div className="result-card__content">
        <p className="eyebrow"><PartyPopper size={16} aria-hidden="true" /> Vi har en vinnare</p>
        <h2 id="winner-title">{event.title}</h2>
        <p className="result-card__title">{event.venue} · {event.city}</p>
        <p className="result-card__votes"><Trophy size={16} aria-hidden="true" />{votes} {votes === 1 ? 'röst' : 'röster'}</p>
        {event.description && <p>{event.description}</p>}
        <dl className="event-detail__facts">
          <div><dt>Datum</dt><dd><time dateTime={event.date}>{date}</time> · {event.time}</dd></div>
          <div><dt>Entré</dt><dd>{formatPricePerPerson(event.price)}</dd></div>
        </dl>
        {event.ticketUrl && (
          <div className="result-card__actions">
            <a href={event.ticketUrl} className="button button--primary" target="_blank" rel="noopener noreferrer">
              Köp biljetter<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (öppnas i ny flik)</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
