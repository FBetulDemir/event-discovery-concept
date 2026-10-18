import { notFound } from 'next/navigation';
import { ArrowUpRight, Users } from 'lucide-react';
import { findEvent } from '@/lib/events/catalog';
import { formatAge, formatPricePerPerson } from '@/lib/format';
import { PageContainer } from '@/components/layout/PageContainer';
import { EventMeta } from '@/components/events/EventMeta';
import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { BackLink } from '@/components/ui/BackLink';

export const dynamic = 'force-dynamic';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await findEvent(decodeURIComponent(id));
  if (!event) notFound();
  const date = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`));
  const age = formatAge(event.ageRestriction);

  return (
    <PageContainer className="event-page">
      <div className="page event-detail">
        <BackLink href="/#event-list" label="Alla event" className="event-detail__back" />
        <figure className="event-detail__image" data-reveal>
          <img src={event.image} alt={event.imageAlt} width={900} height={1125} />
        </figure>
        <div className="event-detail__content enter">
          <h1 className="event-detail__title" data-reveal>{event.title}</h1>
          <div className="event-detail__tags" data-reveal style={{ '--i': 1 } as React.CSSProperties}><Tag tone="paper">{event.category}</Tag><Tag>{event.city}</Tag></div>
          <div data-reveal style={{ '--i': 2 } as React.CSSProperties}><EventMeta event={event} /></div>
          <p className="lead" data-reveal style={{ '--i': 3 } as React.CSSProperties}><time dateTime={event.date}>{date}</time></p>
          {event.source === 'demo' && <p className="muted">Exempelevent som återkommer varje vecka. Nästa tillfälle visas ovan.</p>}
          {event.description && <p className="event-detail__description measure">{event.description}</p>}
          <dl className="facts" data-reveal style={{ '--i': 4 } as React.CSSProperties}>
            <div><dt>Entré</dt><dd>{formatPricePerPerson(event.price)}</dd></div>
            {age && <div><dt>Åldersgräns</dt><dd>{age}</dd></div>}
            <div><dt>Från centrum</dt><dd>{event.distanceKm.toLocaleString('sv-SE')} km</dd></div>
          </dl>
          <div className="event-detail__actions" data-reveal style={{ '--i': 5 } as React.CSSProperties}>
            <ButtonLink href={`/plan/new?event=${encodeURIComponent(event.id)}`}><Users size={18} aria-hidden="true" />Planera med vänner</ButtonLink>
            {event.ticketUrl && (
              <a href={event.ticketUrl} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">
                Biljetter hos säljaren<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (öppnas i ny flik)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
