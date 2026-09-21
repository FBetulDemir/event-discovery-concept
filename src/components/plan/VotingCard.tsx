import { Check, Clock3, MapPin } from 'lucide-react';
import type { Event } from '@/types/event';
import { Chip } from '@/components/ui/Chip';

type VotingCardProps = {
  event: Event;
  votes: number;
  isMine: boolean;
  onVote: () => void;
};

/** One shortlisted option in the "plan with friends" vote. Reused for every card in the list. */
export function VotingCard({ event, votes, isMine, onVote }: VotingCardProps) {
  return (
    <article className={`event-card voting-card${isMine ? ' voting-card--mine' : ''}`} aria-labelledby={`voting-title-${event.id}`}>
      <div className="event-image">
        <img src={event.image} alt={event.imageAlt} width={900} height={600} loading="lazy" />
        <span className="event-category">{event.category}</span>
      </div>
      <div className="event-body">
        <h2 id={`voting-title-${event.id}`}>{event.venue}</h2>
        <div className="event-meta">
          <span><MapPin size={14} aria-hidden="true" />{event.city}</span>
          <span><Clock3 size={14} aria-hidden="true" />{event.time}</span>
        </div>
        <div className="voting-card__footer">
          <span className="voting-card__count" role="status" aria-live="polite" aria-atomic="true">
            {votes} {votes === 1 ? 'röst' : 'röster'}
          </span>
          <Chip selected={isMine} onClick={onVote} aria-label={`${isMine ? 'Ta bort din röst för' : 'Rösta på'} ${event.venue}`}>
            {isMine && <Check size={16} aria-hidden="true" />}
            {isMine ? 'Din röst' : 'Rösta'}
          </Chip>
        </div>
      </div>
    </article>
  );
}
