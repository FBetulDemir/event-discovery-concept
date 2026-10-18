import type { Event } from '@/types/event';
import { EventCard } from './EventCard';

export function EventGrid({ events }: { events: Event[] }) {
  return <div className="event-grid">{events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>;
}
