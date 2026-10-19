'use client';

import { useState } from 'react';
import type { Event } from '@/types/event';
import { toSnapshot } from '@/lib/plans/snapshot';
import { VotingCard } from '@/components/plan/VotingCard';

/** Gallery-only: a voting card you can press, with local state. */
export function VoteDemo({ event }: { event: Event }) {
  const [mine, setMine] = useState(true);
  return <VotingCard event={toSnapshot(event)} votes={mine ? 2 : 1} isMine={mine} onVote={() => setMine(current => !current)} />;
}
