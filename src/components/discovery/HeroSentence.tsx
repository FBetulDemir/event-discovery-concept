'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { defaultPreferences } from '@/data/match-options';
import { matchEvents, type Reason } from '@/lib/matching';
import { formatPrice, formatWhen } from '@/lib/format';
import { todayInGothenburg } from '@/lib/dates';
import { moodLabel } from '@/lib/i18n/labels';
import type { Mood } from '@/types/preferences';
import { Chip } from '@/components/ui/Chip';
import { Button, ButtonLink } from '@/components/ui/Button';
import { usePreferences } from '@/components/match/PreferencesProvider';
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
  const { listed: events } = useHomeCatalog();
  const t = useTranslations('home.hero');
  const all = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { setPreferences, setCompleted, resetPreferences } = usePreferences();
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
    if (!now) return events.slice(0, 5).map(event => ({ event, reasons: [] as Reason[] }));
    return matchEvents(events, { ...defaultPreferences, distance: 15, moods: mood ? [mood] : [] }, { now }).slice(0, 5);
  }, [events, now, mood]);

  useEffect(() => { setIndex(0); }, [mood]);
  useEffect(() => {
    if (paused || reduced || picks.length < 2) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % picks.length), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, picks.length]);

  const current = picks[index % Math.max(picks.length, 1)]?.event;
  const when = current && now ? `${formatWhen(current.date, todayInGothenburg(new Date(now)), locale, all)} ${current.time.slice(0, 5)}` : '';

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="page hero__inner">
        <h1 id="hero-title" className="display hero__sentence">
          <span>{t('line1')}</span>
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
          <span>{t('line2')}</span>
        </h1>

        <div className="hero__foot">
          <p className="hero__lead lead">{t('lead')}</p>

          <div className="hero__moods" role="group" aria-label={t('moodsLabel')}>
            <Chip selected={mood === null} onClick={() => setMood(null)}>{t('anything')}</Chip>
            {moods.map(option => (
              <Chip key={option} selected={mood === option} onClick={() => setMood(mood === option ? null : option)}>{moodLabel(all, option)}</Chip>
            ))}
          </div>

          <div className="hero__act">
            <div className="hero__buttons">
              <Button onClick={() => {
                if (mood) {
                  // A chosen mood is a finished search: go straight to the three explained picks.
                  setPreferences({ ...defaultPreferences, distance: 15, moods: [mood] });
                  setCompleted(true);
                  router.push('/match/results');
                } else {
                  resetPreferences();
                  router.push('/match');
                }
              }}>{mood ? t('showMood', { mood: moodLabel(all, mood).toLocaleLowerCase(locale) }) : t('find')}<ArrowUpRight size={18} aria-hidden="true" /></Button>
              <ButtonLink href="/plan/new" variant="secondary">{t('gather')}</ButtonLink>
            </div>
            {current && (
              <p className="hero__now" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                <span className="muted">{when} · {current.venue}</span>
                <Link href={`/events/${encodeURIComponent(current.id)}`} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>{current.title}</Link>
                <span className="muted">{formatPrice(current.price, all)}</span>
              </p>
            )}
          </div>
        </div>
        <p className="sr-only" role="status">{now ? (mood ? t('statusMood', { count: picks.length, mood: moodLabel(all, mood) }) : t('status', { count: picks.length })) : ''}</p>
      </div>
    </section>
  );
}
