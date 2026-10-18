import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarDays, Users } from 'lucide-react';
import { findEvent } from '@/lib/events/catalog';
import { formatAge, formatPricePerPerson } from '@/lib/format';
import { PageContainer } from '@/components/layout/PageContainer';
import { EventMeta } from '@/components/events/EventMeta';

export const dynamic = 'force-dynamic';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await findEvent(decodeURIComponent(id));
  if (!event) notFound();
  const date = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`));
  const age = formatAge(event.ageRestriction);

  return (
    <PageContainer className="event-detail-page">
      <Link href="/matches" className="text-link"><ArrowLeft size={17} aria-hidden="true" />Till matchningarna</Link>
      <article className="event-detail">
        <img className="event-detail__image" src={event.image} alt={event.imageAlt} width={900} height={600} />
        <div className="event-detail__content">
          <p className="eyebrow">{event.category} · {event.city}</p>
          <h1>{event.title}</h1>
          <EventMeta event={event} />
          <p className="event-detail__date"><CalendarDays size={17} aria-hidden="true" /><time dateTime={event.date}>{date}</time></p>
          {event.source === 'demo' && <p>Exempelevent som återkommer varje vecka · nästa tillfälle visas ovan.</p>}
          {event.description && <p>{event.description}</p>}
          <dl className="event-detail__facts">
            <div><dt>Entré</dt><dd>{formatPricePerPerson(event.price)}</dd></div>
            {age && <div><dt>Åldersgräns</dt><dd>{age}</dd></div>}
            <div><dt>Från centrum</dt><dd>{event.distanceKm.toLocaleString('sv-SE')} km</dd></div>
          </dl>
          <Link href={`/plan/new?event=${encodeURIComponent(event.id)}`} className="button button--primary"><Users size={17} aria-hidden="true" />Planera med vänner</Link>
          {event.ticketUrl && (
            <a href={event.ticketUrl} className="button button--secondary" target="_blank" rel="noopener noreferrer">
              Biljetter hos säljaren<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (öppnas i ny flik)</span>
            </a>
          )}
        </div>
      </article>
    </PageContainer>
  );
}
