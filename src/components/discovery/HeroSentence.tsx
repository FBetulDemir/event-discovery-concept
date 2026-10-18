'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { defaultPreferences } from '@/data/match-options';
import { matchEvents } from '@/lib/matching';
import { formatPrice } from '@/lib/format';
import type { Mood } from '@/types/preferences';
import { Chip } from '@/components/ui/Chip';
import { ButtonLink } from '@/components/ui/Button';
import { useHomeCatalog } from './CatalogProvider';
import { useNow } from './useNow';

const moods: Mood[] = ['Dansa', 'Livemusik', 'Skratta', 'Hänga'];
const CYCLE_MS = 5000;

/**
 * The front door: "Vad gör vi ikväll?" at poster scale, with tonight's real events playing inside
 * the sentence (the live thing). Pick a mood and the answer changes; the slot links to the event.
 * Without script the server already renders the first real event.
 */
export function HeroSentence() {
  const { events } = useHomeCatalog();
  const now = useNow();
  const [mood, setMood] = useState<Mood | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const listener = () => setReduced(query.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  const picks = useMemo(() => {
    if (!now) return events.slice(0, 5).map(event => ({ event, reasons: [] as string[] }));
    return matchEvents(events, { ...defaultPreferences, distance: 15, moods: mood ? [mood] : [] }, { now }).slice(0, 5);
  }, [events, now, mood]);

  useEffect(() => { setIndex(0); }, [mood]);
  useEffect(() => {
    if (paused || reduced || picks.length < 2) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % picks.length), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, picks.length]);

  const current = picks[index % Math.max(picks.length, 1)]?.event;
  const when = current ? `${current.date === now?.slice(0, 10) ? 'Ikväll' : new Intl.DateTimeFormat('sv-SE', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${current.date}T12:00:00Z`))} ${current.time.slice(0, 5)}` : '';

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="page hero__inner">
        <h1 id="hero-title" className="display hero__sentence">
          <span>Vad gör vi</span>
          <span className="hero__slot-wrap">
            {current ? (
              <Link
                key={current.id}
                href={`/events/${encodeURIComponent(current.id)}`}
                className="hero__slot"
                tabIndex={-1}
                aria-hidden="true"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <img src={current.image} alt="" width={640} height={400} fetchPriority="high" />
              </Link>
            ) : <span className="hero__slot hero__slot--empty" aria-hidden="true" />}
          </span>
          <span>ikväll?</span>
        </h1>

        <div className="hero__foot">
          <p className="hero__lead lead">Riktiga kvällar i Göteborg. Välj känsla, skicka länken, låt gänget rösta.</p>

          <div className="hero__moods" role="group" aria-label="Vad är du sugen på?">
            <Chip selected={mood === null} onClick={() => setMood(null)}>Allt</Chip>
            {moods.map(option => (
              <Chip key={option} selected={mood === option} onClick={() => setMood(mood === option ? null : option)}>{option}</Chip>
            ))}
          </div>

          <div className="hero__act">
            <ButtonLink href="/match">Hitta kvällen<ArrowUpRight size={18} aria-hidden="true" /></ButtonLink>
            {current && (
              <p className="hero__now" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                <span className="muted">{when} · {current.venue}</span>
                <Link href={`/events/${encodeURIComponent(current.id)}`} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>{current.title}</Link>
                <span className="muted">{formatPrice(current.price)}</span>
              </p>
            )}
          </div>
        </div>
        <p className="sr-only" role="status">{now ? `${picks.length} förslag${mood ? ` för ${mood}` : ''}` : ''}</p>
      </div>
    </section>
  );
}
