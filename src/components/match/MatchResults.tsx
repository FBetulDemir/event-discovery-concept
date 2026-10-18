'use client';

import { useEffect, useState } from 'react';
import { useEvents } from '@/lib/useEvents';
import { matchEvents } from '@/lib/matching';
import { EventCard } from '@/components/events/EventCard';
import { ButtonLink } from '@/components/ui/Button';
import { BackLink } from '@/components/ui/BackLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePreferences } from './PreferencesProvider';
import { MatchSummary } from './MatchSummary';

const countWord = ['Inga', 'En', 'Två', 'Tre'];

export function MatchResults() {
  const events = useEvents();
  const { preferences, completed } = usePreferences();
  const [now, setNow] = useState<string | null>(null);

  // Take a client-side clock snapshot after hydration; the pure engine receives it explicitly.
  useEffect(() => { setNow(new Date().toISOString()); }, []);

  const ready = now !== null && events.length > 0;
  const recommendations = ready ? matchEvents(events, preferences, { now }).slice(0, 3) : [];
  const count = recommendations.length;
  const title = !ready ? 'Letar efter kvällar' : count === 0 ? 'Ingen perfekt kväll just här' : `${countWord[count]} ${count === 1 ? 'kväll' : 'kvällar'} som passar`;

  return (
    <div className="page results">
      <BackLink href="/match" label="Ändra mina val" className="results__back" />
      <h1 id="results-title" className="head results__title" data-reveal>{title}</h1>
      <p className="lead muted">{completed ? 'Du gav oss känslan. Här är kvällarna som passar.' : 'En första känsla för vad som finns. Gör dina val för personliga matchningar.'}</p>
      <MatchSummary preferences={preferences} />

      <section aria-labelledby="results-title" aria-busy={!ready} className="results__list">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{ready ? `${count} ${count === 1 ? 'matchning' : 'matchningar'}` : 'Hämtar dina matchningar'}</p>
        {!ready ? (
          <div className="event-grid" aria-hidden="true">{[0, 1, 2].map(key => <Skeleton key={key} className="skeleton--card" />)}</div>
        ) : count > 0 ? (
          <div className="event-grid">
            {recommendations.map(({ event, reasons }, index) => <EventCard key={event.id} event={event} index={index} recommendation={{ reasons, rank: index + 1 }} />)}
          </div>
        ) : (
          <EmptyState title="Inga event passar alla dina val" action={<ButtonLink href="/match">Ändra mina val</ButtonLink>}>
            Prova ett annat datum, en större radie eller en annan budget. Event som redan har börjat visas inte.
          </EmptyState>
        )}
      </section>

      <p className="small muted results__footnote" data-reveal>Sorterat efter känsla, tid, budget och avstånd. Inga sponsrade placeringar.</p>
    </div>
  );
}
