import { Check, Trash2 } from 'lucide-react';
import type { EventSnapshot } from '@/lib/plans/snapshot';
import { formatPrice } from '@/lib/format';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Tag } from '@/components/ui/Tag';

type VotingCardProps = {
  event: EventSnapshot;
  votes: number;
  isMine: boolean;
  /** Names of the people who voted for this option. */
  voters?: string[];
  /** Voting is closed once the plan is decided. */
  disabled?: boolean;
  onVote: () => void;
  onRemove?: () => void;
};

const dateFormatter = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** One shortlisted option in a plan's vote. Reused for every option in the list. */
export function VotingCard({ event, votes, isMine, voters = [], disabled = false, onVote, onRemove }: VotingCardProps) {
  const date = dateFormatter.format(new Date(`${event.date}T12:00:00Z`)).replaceAll('.', '');
  return (
    <article className={`vote-card${isMine ? ' vote-card--mine' : ''}`} aria-labelledby={`voting-title-${event.id}`} data-reveal>
      <img className="vote-card__image" src={event.image} alt={event.imageAlt} width={480} height={600} loading="lazy" />
      <div className="vote-card__body">
        <Tag tone="paper">{event.category}</Tag>
        <h2 id={`voting-title-${event.id}`} className="vote-card__title">{event.title}</h2>
        <p className="muted">{event.venue}, <time dateTime={event.date}>{date}</time> {event.time.slice(0, 5)}</p>
        <p className="muted">{formatPrice(event.price)}</p>
        {voters.length > 0 && <p className="vote-card__voters"><span className="muted">Röstat av</span> {voters.join(', ')}</p>}
        <div className="vote-card__footer">
          <span className="vote-card__count" role="status" aria-live="polite" aria-atomic="true">{votes} {votes === 1 ? 'röst' : 'röster'}</span>
          <div className="vote-card__actions">
            {onRemove && !disabled && <IconButton label={`Ta bort ${event.title} från listan`} onClick={onRemove}><Trash2 size={18} aria-hidden="true" /></IconButton>}
            <Chip selected={isMine} disabled={disabled} onClick={onVote} aria-label={`${isMine ? 'Ta bort din röst för' : 'Rösta på'} ${event.title}`}>
              {isMine && <Check size={16} aria-hidden="true" />}{isMine ? 'Din röst' : 'Rösta'}
            </Chip>
          </div>
        </div>
      </div>
    </article>
  );
}
