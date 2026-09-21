import { Clock3, MapPin } from 'lucide-react';
import type { Event } from '@/types/event';

export function EventMeta({ event }: { event: Event }) {
  return (
    <div className="event-meta">
      <span><MapPin size={14} aria-hidden="true" />{event.venue}</span>
      <span><Clock3 size={14} aria-hidden="true" />{event.time}</span>
    </div>
  );
}
