'use client';

import Link from 'next/link';
import { ArrowLeft, PartyPopper, SlidersHorizontal, Ticket, Trophy } from 'lucide-react';
import { events } from '@/data/events';
import { Button } from '@/components/ui/Button';
import { EventMeta } from '@/components/events/EventMeta';
import { useShortlist } from './ShortlistProvider';

const CONFETTI_COLORS = ['confetti--mint', 'confetti--orange', 'confetti--pink'] as const;
// Deterministic spread (no Math.random) so server- and client-rendered markup match.
const confettiPieces = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 61) % 100,
  delay: (i * 137) % 600,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

export function ResultExperience() {
  const { shortlist, votes } = useShortlist();

  const shortlisted = shortlist
    .map(id => events.find(event => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  const winner = shortlisted.reduce<{ event: (typeof shortlisted)[number]; count: number } | null>((best, event) => {
    const count = votes[event.id] ?? 0;
    return !best || count > best.count ? { event, count } : best;
  }, null);

  if (!winner) {
    return (
      <section className="plan-page">
        <Link href="/plan" className="text-link"><ArrowLeft size={17} aria-hidden="true" />Till röstningen</Link>
        <h1>Inget att utse än</h1>
        <p>Lägg till och rösta på event i er lista för att se en vinnare här.</p>
        <Link href="/plan" className="button button--primary"><SlidersHorizontal size={17} aria-hidden="true" />Till röstningen</Link>
      </section>
    );
  }

  const { event, count } = winner;
  const date = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`));

  return (
    <section className="plan-page result-page">
      <Link href="/plan" className="text-link"><ArrowLeft size={17} aria-hidden="true" />Till röstningen</Link>
      <div className="result-confetti" aria-hidden="true">
        {confettiPieces.map((piece, i) => (
          <span key={i} className={`result-confetti__piece ${piece.color}`} style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}ms` }} />
        ))}
      </div>
      <p className="eyebrow"><Trophy size={16} aria-hidden="true" /> Fredag kväll · resultat</p>
      <h1 className="result-page__heading">Vi har en vinnare<PartyPopper size={30} aria-hidden="true" /></h1>
      <article className="result-card">
        <img className="result-card__image" src={event.image} alt={event.imageAlt} width={900} height={600} />
        <div className="result-card__content">
          <p className="eyebrow">{event.category} · {event.city}</p>
          <h2>{event.venue}</h2>
          <p className="result-card__title">{event.title}</p>
          <EventMeta event={event} />
          <p className="result-card__votes"><Trophy size={16} aria-hidden="true" />{count} {count === 1 ? 'röst' : 'röster'}, flest av alla</p>
          <p>{event.description}</p>
          <dl className="event-detail__facts">
            <div><dt>Entré</dt><dd>{event.price ? `${event.price} kr / person` : 'Fri entré'}</dd></div>
            <div><dt>Datum</dt><dd>{date}</dd></div>
            <div><dt>Från centrum</dt><dd>{event.distanceKm.toLocaleString('sv-SE')} km</dd></div>
          </dl>
          <div className="result-card__actions">
            <Button><Ticket size={17} aria-hidden="true" />Köp biljetter</Button>
            <Link href={`/events/${event.id}`} className="button button--secondary">Visa event</Link>
          </div>
        </div>
      </article>
    </section>
  );
}
