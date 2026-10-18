import { Check } from 'lucide-react';
import type { PlanMember, PlanVote } from '@/lib/plans/api';

/** Who is in, and who has voted. The notch-cornered squares echo the plan ticket. */
export function PlanMembers({ members, votes, showVotes }: { members: PlanMember[]; votes: PlanVote[]; showVotes: boolean }) {
  const voted = new Set(votes.map(vote => vote.userId));
  return (
    <ul className="members" aria-label="Med i planen">
      {members.map(member => {
        const has = voted.has(member.userId);
        return (
          <li key={member.userId} className={`member${has ? ' is-voted' : ''}`}>
            <span className="member__avatar" aria-hidden="true">{member.displayName.slice(0, 1).toUpperCase()}</span>
            <span className="member__name">{member.displayName}{member.role === 'organizer' && <span className="muted small"> (arrangör)</span>}</span>
            {showVotes && (
              <span className="member__state small">
                {has ? <><Check size={14} aria-hidden="true" />har röstat</> : <span className="muted">har inte röstat</span>}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
