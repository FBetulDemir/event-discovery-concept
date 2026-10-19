/**
 * Vote counting for a plan. Pure and framework-free. The database function `close_plan`
 * applies the same rule on the server, which is the source of truth when voting is closed:
 * the leader wins; several leaders is a tie the organizer must break by picking one.
 */

export type Tally = { planEventId: string; votes: number }[];

export type Outcome =
  | { kind: 'none' }
  | { kind: 'winner'; planEventId: string; votes: number }
  | { kind: 'tie'; planEventIds: string[]; votes: number };

/** One entry per shortlisted event, in shortlist order. Votes for unknown events are ignored. */
export function tallyVotes(planEventIds: readonly string[], votes: readonly { planEventId: string }[]): Tally {
  const counts = new Map(planEventIds.map(id => [id, 0]));
  for (const vote of votes) {
    if (counts.has(vote.planEventId)) counts.set(vote.planEventId, counts.get(vote.planEventId)! + 1);
  }
  return planEventIds.map(planEventId => ({ planEventId, votes: counts.get(planEventId)! }));
}

export function outcomeOf(tally: Tally): Outcome {
  if (tally.length === 0) return { kind: 'none' };
  const top = Math.max(...tally.map(entry => entry.votes));
  const leaders = tally.filter(entry => entry.votes === top);
  return leaders.length === 1
    ? { kind: 'winner', planEventId: leaders[0].planEventId, votes: top }
    : { kind: 'tie', planEventIds: leaders.map(entry => entry.planEventId), votes: top };
}

/** Clicking your current choice withdraws it; clicking another moves your single vote. */
export function nextVote(current: string | null, clicked: string): string | null {
  return current === clicked ? null : clicked;
}
