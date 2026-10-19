'use client';

import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { addDays, formatDay, todayInGothenburg } from '@/lib/dates';
import { formatPrice, formatWhen } from '@/lib/format';
import { cityLabel } from '@/lib/i18n/labels';
import { useHomeCatalog } from './CatalogProvider';
import { useNow } from './useNow';

/** The next evening with events, as a schedule: when, what and where, what it costs. */
export function TonightList() {
  const { listed: events } = useHomeCatalog();
  const t = useTranslations('home.tonight');
  const all = useTranslations();
  const locale = useLocale();
  const now = useNow();
  const today = now ? todayInGothenburg(new Date(now)) : null;

  const upcoming = events.filter(event => !today || event.date >= today);
  const first = upcoming[0]?.date;
  // One evening if it has enough on it; otherwise carry on into the next days so the list is never a single row.
  const sameDay = upcoming.filter(event => event.date === first);
  const rows = (sameDay.length >= 5 ? sameDay : upcoming).slice(0, 8);
  const isToday = first !== undefined && first === today;
  const heading = !today || (isToday && sameDay.length >= 5) ? t('headingTonight')
    : isToday ? t('headingSoon')
    : first === addDays(today, 1) ? t('headingTomorrow')
    : t('headingOn', { when: formatWhen(first!, today, locale, all) });
  const shortDay = (date: string) => formatDay(date, locale, { weekday: 'short' }).replaceAll('.', '');
  const lead = rows[0];

  return (
    <section className="section tonight" aria-labelledby="tonight-title">
      <div className="page tonight__inner">
        <h2 id="tonight-title" className="head tonight__title" data-reveal>{heading}</h2>
        {rows.length === 0 ? (
          <p className="tonight__empty muted">{t('empty')}</p>
        ) : (
          <>
            {lead && (
              <figure className="tonight__photo" data-reveal>
                <img src={lead.image} alt={lead.imageAlt} width={640} height={800} loading="lazy" />
              </figure>
            )}
            <ul className="schedule" aria-label={t('listLabel')}>
              {rows.map((event, index) => (
                <li key={event.id} data-reveal style={{ '--i': index } as React.CSSProperties}>
                  <Link href={`/events/${encodeURIComponent(event.id)}`} className="schedule__row">
                    <span className="schedule__when">
                      <span className="schedule__day muted">{shortDay(event.date)}</span>
                      <time className="schedule__time" dateTime={event.date}>{event.time.slice(0, 5)}</time>
                    </span>
                    <span className="schedule__what">
                      <span className="schedule__title">{event.title}</span>
                      <span className="muted">{event.venue}, {cityLabel(all, event.city)}</span>
                    </span>
                    <span className="schedule__price">{formatPrice(event.price, all)}</span>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
