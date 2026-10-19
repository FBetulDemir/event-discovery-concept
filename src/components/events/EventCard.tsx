import { Link } from '@/i18n/navigation';
import { Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Event } from '@/types/event';
import type { Reason } from '@/lib/matching';
import { formatKm, formatPrice } from '@/lib/format';
import { categoryLabel } from '@/lib/i18n/labels';
import { Tag } from '@/components/ui/Tag';
import { ButtonLink } from '@/components/ui/Button';
import { EventMeta } from './EventMeta';
import { MatchReasons } from './MatchReasons';

type EventCardProps = {
  event: Event;
  /** Present in Match results: shows the reasons and a plan action. */
  recommendation?: { reasons: readonly Reason[]; rank: number };
  /** Stagger index for the entrance animation. */
  index?: number;
};

/** The one event card. The title is the link and covers the whole card; secondary actions sit above it. */
export function EventCard({ event, recommendation, index = 0 }: EventCardProps) {
  const unknownPrice = event.price === null;
  const t = useTranslations('events');
  const all = useTranslations();
  const locale = useLocale();
  return (
    <article className={`event-card${recommendation ? ' event-card--match' : ''}`} data-reveal style={{ '--i': index % 6 } as React.CSSProperties}>
      <div className="event-card__image">
        <img src={event.image} alt={event.imageAlt} width={800} height={1000} loading={index < 2 ? 'eager' : 'lazy'} />
        <Tag tone="paper" className="event-card__category">{categoryLabel(all, event.category)}</Tag>
      </div>
      <div className="event-card__body">
        <div className="event-card__line">
          <span className={`event-card__price${unknownPrice ? ' is-unknown' : ''}`}>{formatPrice(event.price, all)}</span>
          <span className="muted">{event.moreDates?.length ? all('format.moreDates', { count: event.moreDates.length }) : all('format.km', { km: formatKm(event.distanceKm, locale) })}</span>
        </div>
        <h3 className="event-card__title">
          <Link href={`/events/${encodeURIComponent(event.id)}`} className="event-card__link">{event.title}</Link>
        </h3>
        <EventMeta event={event} />
        {recommendation && (
          <>
            <MatchReasons reasons={recommendation.reasons} />
            <ButtonLink variant="secondary" href={`/plan/new?event=${encodeURIComponent(event.id)}`} className="event-card__plan">
              <Users size={18} aria-hidden="true" />{t('planWithFriends')}<span className="sr-only">: {event.title}</span>
            </ButtonLink>
          </>
        )}
      </div>
    </article>
  );
}
