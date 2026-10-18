import { Clock3, MapPin } from 'lucide-react';
import type { Event } from '@/types/event';

const dateFormatter = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Venue and when, on one compact block. Date is formatted in UTC from a plain YYYY-MM-DD. */
export function EventMeta({ event }: { event: Event }) {
  const date = dateFormatter.format(new Date(`${event.date}T12:00:00Z`)).replaceAll('.', '');
  return (
    <ul className="event-meta">
      <li><MapPin size={16} aria-hidden="true" />{event.venue}</li>
      <li><Clock3 size={16} aria-hidden="true" /><time dateTime={event.date}>{date}</time> · {event.time.replace('–', ' – ')}</li>
    </ul>
  );
}
