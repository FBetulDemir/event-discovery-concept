import { Clock3, MapPin } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { Event } from '@/types/event';
import { formatPlanDate } from '@/lib/plans/dates';

/** Venue and when, on one compact block. Date is formatted in UTC from a plain YYYY-MM-DD. */
export function EventMeta({ event }: { event: Event }) {
  const date = formatPlanDate(event.date, useLocale(), true);
  return (
    <ul className="event-meta">
      <li><MapPin size={16} aria-hidden="true" />{event.venue}</li>
      <li><Clock3 size={16} aria-hidden="true" /><time dateTime={event.date}>{date}</time> · {event.time.replace('–', ' – ')}</li>
    </ul>
  );
}
