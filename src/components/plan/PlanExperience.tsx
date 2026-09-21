'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { events } from '@/data/events';
import { useShortlist } from './ShortlistProvider';
import { VotingCard } from './VotingCard';

export function PlanExperience() {
  const eventId = useSearchParams().get('event');
  const { shortlist, votes, myVote, addToShortlist, vote } = useShortlist();

  // Arriving from "Planera med vänner" on a match adds that event to the shared shortlist.
  useEffect(() => {
    if (eventId) addToShortlist(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const shortlisted = shortlist
    .map(id => events.find(event => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  return (
    <section className="plan-page">
      <Link href="/matches" className="text-link"><ArrowLeft size={17} aria-hidden="true" />Till matchningarna</Link>
      <p className="eyebrow"><Users size={20} aria-hidden="true" /> 4 vänner har gått med</p>
      <h1>Fredag kväll</h1>
      <p className="plan-page__intro">Rösta på det ni ska göra tillsammans. Alla röster syns direkt.</p>
      {shortlisted.length ? (
        <div className="voting-grid">
          {shortlisted.map(event => (
            <VotingCard
              key={event.id}
              event={event}
              votes={votes[event.id] ?? 0}
              isMine={myVote === event.id}
              onVote={() => vote(event.id)}
            />
          ))}
        </div>
      ) : (
        <p>Välj ett event bland dina matchningar för att börja rösta.</p>
      )}
      {shortlisted.length > 0 && <Link href="/plan/result" className="button button--secondary"><Trophy size={17} aria-hidden="true" />Se resultatet</Link>}
      <p className="foundation-copy">Designprototyp · Ingen chatt, inga profiler och inga riktiga inbjudningar än — det här visar bara hur delad röstning kan kännas.</p>
    </section>
  );
}
