'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, AudioLines, Check, Search, SlidersHorizontal, Users } from 'lucide-react';
import { events } from '@/data/events';
import { matchEvents } from '@/lib/matching';
import { EventCard } from '@/components/events/EventCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { usePreferences } from './PreferencesProvider';
import { MatchSummary } from './MatchSummary';

export function MatchResults() {
  const { preferences, completed } = usePreferences();
  const [now, setNow] = useState<string | null>(null);

  // Take a client-side clock snapshot after hydration; the pure engine receives it explicitly.
  useEffect(() => { setNow(new Date().toISOString()); }, []);

  const recommendations = now ? matchEvents(events, preferences, { now }).slice(0, 3) : [];
  const count = recommendations.length;

  return (
    <>
      <nav className="results-path" aria-label="Din väg till kvällen">
        <Link href="/monkey-match"><ArrowLeft size={15} aria-hidden="true" />Dina val</Link>
        <span aria-current="page"><AudioLines size={16} aria-hidden="true" />Dina matchningar</span>
        <span className="results-path__next">Planera tillsammans</span>
      </nav>

      <section className="results-intro" aria-labelledby="results-title">
        <div>
          <p className="eyebrow"><span className="results-live-dot" aria-hidden="true" /> MONKEY MATCH · GÖTEBORG</p>
          <h1 id="results-title">Mindre kanske.<br /><span>Mer vi ses där.</span></h1>
          <p>{completed ? 'Du gav oss känslan. Här är kvällarna som passar.' : 'En första känsla för vad som finns. Anpassa dina val för personliga matchningar.'}</p>
        </div>
        <div className="results-count" aria-hidden="true"><span>{now ? String(count).padStart(2, '0') : '00'}</span><p>UTVALDA FÖR<br />DIN KVÄLL <ArrowUpRight size={20} /></p></div>
      </section>

      <section className="results-preferences" aria-label="Dina val">
        <MatchSummary preferences={preferences} />
        <Link className="results-edit" href="/monkey-match"><SlidersHorizontal size={16} aria-hidden="true" />Ändra mina val</Link>
      </section>

      <section className="results-list" aria-labelledby="recommendations-heading" aria-busy={!now}>
        <SectionHeading id="recommendations-heading" title="Utvalt för din kväll">
          <p className="results-status" role="status" aria-live="polite" aria-atomic="true">{now ? `${count} ${count === 1 ? 'matchning' : 'matchningar'}` : 'Hämtar dina matchningar…'}</p>
        </SectionHeading>
        {!now ? (
          <div className="results-loading" aria-hidden="true"><AudioLines size={32} /><p>Vi kollar vad som passar dina val.</p></div>
        ) : count > 0 ? (
          <div className="matches-grid">
            {recommendations.map(({ event, reasons }, index) => <EventCard key={event.id} event={event} recommendation={{ reasons, rank: index + 1 }} />)}
          </div>
        ) : (
          <div className="results-empty">
            <Search size={32} aria-hidden="true" />
            <h3>Ingen perfekt kväll just här. Än.</h3>
            <p>Inga event passar alla dina val. Prova ett annat datum, en större radie eller en annan budget.</p>
            <p className="field-help">Event som redan har börjat visas inte.</p>
            <Link href="/monkey-match" className="button button--primary"><SlidersHorizontal size={17} aria-hidden="true" />Ändra mina val</Link>
            <Link href="/" className="text-link">Utforska alla exempel<ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        )}
      </section>

      {count > 0 && <aside className="results-together" aria-labelledby="together-title">
        <span className="results-together__icon"><Users size={28} aria-hidden="true" /></span>
        <div><p className="eyebrow">NÄSTA STEG · DITT GÄNG</p><h2 id="together-title">Bra själv. Bättre tillsammans.</h2><p>Hittat något du gillar? Välj ”Planera med vänner” på ett event för att börja er plan.</p></div>
        <span className="results-together__arrow" aria-hidden="true"><ArrowUpRight size={30} /></span>
      </aside>}

      <footer className="results-footnote"><Check size={15} aria-hidden="true" /><p>Sorterat efter känsla, tid, budget och avstånd. Inga sponsrade placeringar.</p></footer>
    </>
  );
}
