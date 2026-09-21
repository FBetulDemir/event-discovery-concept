'use client';

import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { usePreferences } from './PreferencesProvider';
import { MatchSummary } from './MatchSummary';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** A review destination for this step; event matching is implemented separately. */
export function MatchesHandoff() {
  const { preferences, completed } = usePreferences();
  return (
    <section className="matches-handoff" aria-labelledby="handoff-heading">
      {completed && <span className="handoff-check"><Check size={24} aria-hidden="true" /></span>}
      <SectionHeading as="h1" id="handoff-heading" eyebrow="MONKEY MATCH" title={completed ? 'Din kväll tar form.' : 'Vad är din vibe?'} />
      <p className="foundation-copy">{completed ? 'Dina val följer med. Matchningsresultaten kommer i nästa del av prototypen.' : 'Börja med att berätta när, var och hur du vill gå ut.'}</p>
      {completed && <MatchSummary preferences={preferences} />}
      <Link href="/monkey-match" className="button button--primary"><ArrowLeft size={17} aria-hidden="true" />{completed ? 'Ändra mina val' : 'Starta Monkey Match'}</Link>
    </section>
  );
}
