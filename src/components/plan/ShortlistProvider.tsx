'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Seeded so the "Plan with friends" prototype has something to vote on right away.
 * The 4 friends shown as "joined" on /plan have each already cast one vote, so these
 * sum to 4; your own vote is the 5th, on top of theirs.
 */
const initialShortlist = ['yaki-da', 'standup', 'tradgarn'];
const initialVotes: Record<string, number> = { 'yaki-da': 1, standup: 0, tradgarn: 3 };

type ShortlistContextValue = {
  shortlist: string[];
  votes: Record<string, number>;
  /** The event id the current person has voted for, or null if they haven't voted. */
  myVote: string | null;
  addToShortlist: (eventId: string) => void;
  vote: (eventId: string) => void;
};

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

/**
 * Shared shortlist and vote tally for the "plan with friends" prototype.
 * In-memory only: no invitations, accounts or real-time sync, per the prototype scope.
 */
export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [shortlist, setShortlist] = useState<string[]>(initialShortlist);
  const [votes, setVotes] = useState<Record<string, number>>(initialVotes);
  const [myVote, setMyVote] = useState<string | null>(null);

  function addToShortlist(eventId: string) {
    setShortlist(current => (current.includes(eventId) ? current : [...current, eventId]));
    setVotes(current => (eventId in current ? current : { ...current, [eventId]: 0 }));
  }

  function vote(eventId: string) {
    const previous = myVote;
    const next = previous === eventId ? null : eventId;
    setMyVote(next);
    setVotes(current => {
      const updated = { ...current };
      if (previous) updated[previous] = Math.max(0, (updated[previous] ?? 0) - 1);
      if (next) updated[next] = (updated[next] ?? 0) + 1;
      return updated;
    });
  }

  return (
    <ShortlistContext.Provider value={{ shortlist, votes, myVote, addToShortlist, vote }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (!context) throw new Error('useShortlist requires ShortlistProvider');
  return context;
}
