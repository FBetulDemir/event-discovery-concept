import { ArrowUpRight } from 'lucide-react';
import type { EventSnapshot } from '@/lib/plans/snapshot';
import { formatPricePerPerson } from '@/lib/format';

/** The decided event, on paper. Tickets are bought at the seller: we link out, we do not sell. */
export function WinnerCard({ event, votes }: { event: EventSnapshot; votes: number }) {
  const date = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`));
  return (
    <article className="winner" aria-labelledby="winner-title" data-reveal>
      <img className="winner__image" src={event.image} alt={event.imageAlt} width={900} height={600} />
      <div className="winner__content">
        <p className="winner__kicker">Vi har en vinnare, {votes} {votes === 1 ? 'röst' : 'röster'}</p>
        <h2 id="winner-title" className="winner__title">{event.title}</h2>
        <p>{event.venue}, {event.city}</p>
        {event.description && <p className="winner__description">{event.description}</p>}
        <dl className="facts facts--paper">
          <div><dt>När</dt><dd><time dateTime={event.date}>{date}</time>, {event.time.slice(0, 5)}</dd></div>
          <div><dt>Entré</dt><dd>{formatPricePerPerson(event.price)}</dd></div>
        </dl>
        {event.ticketUrl && (
          <a href={event.ticketUrl} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
            Köp biljetter<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (öppnas i ny flik)</span>
          </a>
        )}
      </div>
    </article>
  );
}
