import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Users } from 'lucide-react';
import { events } from '@/data/events';
import { PageContainer } from '@/components/layout/PageContainer';
import { EventMeta } from '@/components/events/EventMeta';

export function generateStaticParams() { return events.map(event => ({ id: event.id })); }

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find(candidate => candidate.id === id);
  if (!event) notFound();
  const date = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`));

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
          <p>{event.description}</p>
          <dl className="event-detail__facts"><div><dt>Entré</dt><dd>{event.price ? `${event.price} kr / person` : 'Fri entré'}</dd></div><div><dt>Åldersgräns</dt><dd>{event.ageRestriction} år</dd></div><div><dt>Från centrum</dt><dd>{event.distanceKm.toLocaleString('sv-SE')} km</dd></div></dl>
          <Link href={`/plan?event=${event.id}`} className="button button--primary"><Users size={18} aria-hidden="true" />Planera med vänner</Link>
        </div>
      </article>
    </PageContainer>
  );
}
