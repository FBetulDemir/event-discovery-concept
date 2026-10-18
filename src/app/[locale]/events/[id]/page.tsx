import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Users } from 'lucide-react';
import { loadCatalog } from '@/lib/events/catalog';
import { otherDates } from '@/lib/events/series';
import { formatAge, formatKm, formatPricePerPerson } from '@/lib/format';
import { formatDay } from '@/lib/dates';
import { categoryLabel, cityLabel } from '@/lib/i18n/labels';
import { pageLocale } from '@/i18n/page';
import { localizeEvent } from '@/lib/i18n/events';
import { PageContainer } from '@/components/layout/PageContainer';
import { EventMeta } from '@/components/events/EventMeta';
import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { BackLink } from '@/components/ui/BackLink';
import { CommentThread } from '@/components/comments/CommentThread';

export const dynamic = 'force-dynamic';

export default async function EventPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const locale = await pageLocale(params);
  const { id } = await params;
  const t = await getTranslations('event');
  const all = await getTranslations();
  const catalog = await loadCatalog();
  const found = catalog.events.find(candidate => candidate.id === decodeURIComponent(id));
  if (!found) notFound();
  const event = localizeEvent(found, all);
  const more = otherDates(event, catalog.events);
  const date = formatDay(event.date, locale, { dateStyle: 'full' });
  const age = formatAge(event.ageRestriction, all);

  return (
    <PageContainer className="event-page">
      <div className="page event-detail">
        <BackLink href="/#event-list" label={t('backToAll')} className="event-detail__back" />
        <figure className="event-detail__image" data-reveal>
          <img src={event.image} alt={event.imageAlt} width={900} height={1125} />
        </figure>
        <div className="event-detail__content enter">
          <h1 className="event-detail__title" data-reveal>{event.title}</h1>
          <div className="event-detail__tags" data-reveal style={{ '--i': 1 } as React.CSSProperties}><Tag tone="paper">{categoryLabel(all, event.category)}</Tag><Tag>{cityLabel(all, event.city)}</Tag></div>
          <div data-reveal style={{ '--i': 2 } as React.CSSProperties}><EventMeta event={event} /></div>
          <p className="lead" data-reveal style={{ '--i': 3 } as React.CSSProperties}><time dateTime={event.date}>{date}</time></p>
          {event.source === 'demo' && <p className="muted">{t('demoNote')}</p>}
          {event.description && <p className="event-detail__description measure">{event.description}</p>}
          {more.length > 0 && (
            <section className="event-detail__dates" aria-labelledby="more-dates" data-reveal>
              <h2 id="more-dates" className="lead">{t('moreDates')}</h2>
              <ul>
                {more.map(date => (
                  <li key={date.id}><Link href={`/events/${encodeURIComponent(date.id)}`}>{formatDay(date.date, locale, { weekday: 'short', day: 'numeric', month: 'long' })}, {date.time.slice(0, 5)}</Link></li>
                ))}
              </ul>
            </section>
          )}
          <dl className="facts" data-reveal style={{ '--i': 4 } as React.CSSProperties}>
            <div><dt>{t('entry')}</dt><dd>{formatPricePerPerson(event.price, all)}</dd></div>
            {age && <div><dt>{t('ageLimit')}</dt><dd>{age}</dd></div>}
            <div><dt>{t('fromCentre')}</dt><dd>{all('format.km', { km: formatKm(event.distanceKm, locale) })}</dd></div>
          </dl>
          <div className="event-detail__actions" data-reveal style={{ '--i': 5 } as React.CSSProperties}>
            <ButtonLink href={`/plan/new?event=${encodeURIComponent(event.id)}`}><Users size={18} aria-hidden="true" />{t('planWithFriends')}</ButtonLink>
            {event.ticketUrl && (
              <a href={event.ticketUrl} className="btn btn--secondary" target="_blank" rel="noopener noreferrer">
                {t('tickets')}<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only">{t('newTab')}</span>
              </a>
            )}
          </div>
          <CommentThread target={{ type: 'event', id: event.id }} title={t('comments')} startClosed />
        </div>
      </div>
    </PageContainer>
  );
}
