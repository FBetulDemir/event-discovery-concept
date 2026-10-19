import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { EventSnapshot } from '@/lib/plans/snapshot';
import { formatPricePerPerson } from '@/lib/format';
import { formatDay } from '@/lib/dates';
import { cityLabel } from '@/lib/i18n/labels';

/** The decided event, on paper. Tickets are bought at the seller: we link out, we do not sell. */
export function WinnerCard({ event, votes }: { event: EventSnapshot; votes: number }) {
  const t = useTranslations('plan.winner');
  const all = useTranslations();
  const locale = useLocale();
  const date = formatDay(event.date, locale, { dateStyle: 'full' });
  return (
    <article className="winner" aria-labelledby="winner-title" data-reveal>
      <img className="winner__image" src={event.image} alt={event.imageAlt} width={900} height={600} />
      <div className="winner__content">
        <p className="winner__kicker">{t('kicker', { count: votes })}</p>
        <h2 id="winner-title" className="winner__title">{event.title}</h2>
        <p>{event.venue}, {cityLabel(all, event.city)}</p>
        {event.description && <p className="winner__description">{event.description}</p>}
        <dl className="facts facts--paper">
          <div><dt>{t('when')}</dt><dd><time dateTime={event.date}>{date}</time>, {event.time.slice(0, 5)}</dd></div>
          <div><dt>{t('entry')}</dt><dd>{formatPricePerPerson(event.price, all)}</dd></div>
        </dl>
        {event.ticketUrl && (
          <a href={event.ticketUrl} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
            {t('buy')}<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only">{all('common.newTab')}</span>
          </a>
        )}
      </div>
    </article>
  );
}
