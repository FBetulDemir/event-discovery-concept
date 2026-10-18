'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { groupSeries } from '@/lib/events/series';
import { useEvents } from '@/lib/useEvents';
import { matchEvents } from '@/lib/matching';
import { EventCard } from '@/components/events/EventCard';
import { ButtonLink } from '@/components/ui/Button';
import { BackLink } from '@/components/ui/BackLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePreferences } from './PreferencesProvider';
import { MatchSummary } from './MatchSummary';

export function MatchResults() {
  const t = useTranslations('match.results');
  const allEvents = useEvents();
  const events = useMemo(() => groupSeries(allEvents), [allEvents]);
  const { preferences, completed } = usePreferences();
  const [now, setNow] = useState<string | null>(null);

  // Take a client-side clock snapshot after hydration; the pure engine receives it explicitly.
  useEffect(() => { setNow(new Date().toISOString()); }, []);

  const ready = now !== null && events.length > 0;
  const recommendations = ready ? matchEvents(events, preferences, { now }).slice(0, 3) : [];
  const count = recommendations.length;
  const title = !ready ? t('loading') : count === 0 ? t('none') : t('found', { count });

  return (
    <div className="page results">
      <BackLink href="/match" label={t('change')} className="results__back" />
      <h1 id="results-title" className="head results__title" data-reveal>{title}</h1>
      <p className="lead muted">{completed ? t('leadDone') : t('leadFirst')}</p>
      <MatchSummary preferences={preferences} />

      <section aria-labelledby="results-title" aria-busy={!ready} className="results__list">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{ready ? t('status', { count }) : t('fetching')}</p>
        {!ready ? (
          <div className="event-grid" aria-hidden="true">{[0, 1, 2].map(key => <Skeleton key={key} className="skeleton--card" />)}</div>
        ) : count > 0 ? (
          <div className="event-grid">
            {recommendations.map(({ event, reasons }, index) => <EventCard key={event.id} event={event} index={index} recommendation={{ reasons, rank: index + 1 }} />)}
          </div>
        ) : (
          <EmptyState title={t('emptyTitle')} action={<ButtonLink href="/match">{t('change')}</ButtonLink>}>
            {t('emptyBody')}
          </EmptyState>
        )}
      </section>

      <p className="small muted results__footnote" data-reveal>{t('footnote')}</p>
    </div>
  );
}
