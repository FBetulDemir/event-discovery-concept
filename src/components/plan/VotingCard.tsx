import { Check, Clock3, MapPin, Trash2 } from 'lucide-react';
import type { EventSnapshot } from '@/lib/plans/snapshot';
import { formatPrice } from '@/lib/format';
import { Chip } from '@/components/ui/Chip';

type VotingCardProps = {
  event: EventSnapshot;
  votes: number;
  isMine: boolean;
  /** Voting is closed once the plan is decided. */
  disabled?: boolean;
  onVote: () => void;
  onRemove?: () => void;
};

/** One shortlisted option in a plan's vote. Reused for every card in the list. */
export function VotingCard({ event, votes, isMine, disabled = false, onVote, onRemove }: VotingCardProps) {
  return (
    <article className={`event-card voting-card${isMine ? ' voting-card--mine' : ''}`} aria-labelledby={`voting-title-${event.id}`}>
      <div className="event-image">
        <img src={event.image} alt={event.imageAlt} width={900} height={600} loading="lazy" />
        <span className="event-category">{event.category}</span>
      </div>
      <div className="event-body">
        <h2 id={`voting-title-${event.id}`}>{event.title}</h2>
        <div className="event-meta">
          <span><MapPin size={14} aria-hidden="true" />{event.venue}</span>
          <span><Clock3 size={14} aria-hidden="true" /><time dateTime={event.date}>{event.date}</time> · {event.time}</span>
          <span>{formatPrice(event.price)}</span>
        </div>
        <div className="voting-card__footer">
          <span className="voting-card__count" role="status" aria-live="polite" aria-atomic="true">
            {votes} {votes === 1 ? 'röst' : 'röster'}
          </span>
          <div className="voting-card__actions">
            {onRemove && !disabled && (
              <button type="button" className="icon-button" onClick={onRemove} aria-label={`Ta bort ${event.title} från listan`}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
            <Chip selected={isMine} disabled={disabled} onClick={onVote} aria-label={`${isMine ? 'Ta bort din röst för' : 'Rösta på'} ${event.title}`}>
              {isMine && <Check size={16} aria-hidden="true" />}
              {isMine ? 'Din röst' : 'Rösta'}
            </Chip>
          </div>
        </div>
      </div>
    </article>
  );
}
