'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePreferences } from './PreferencesProvider';
import { LocationStep } from './LocationStep';
import { MoodStep } from './MoodStep';
import { BudgetStep } from './BudgetStep';
import { MatchSummary } from './MatchSummary';
import type { Preferences } from '@/types/preferences';
import { dateSelectionComplete } from '@/lib/dates';

const steps = [
  { label: 'När och var', title: 'Var börjar din kväll?', description: 'En plats och en dag. Resten hittar vi tillsammans.' },
  { label: 'Din känsla', title: 'Vad är du sugen på?', description: 'Dansgolv eller skönt häng? Det finns inget fel svar.' },
  { label: 'Din budget', title: 'Vad får kvällen kosta?', description: 'Hitta något som känns rätt, även för plånboken.' },
] as const;

/** The guided way in: three short steps, each skippable after the first, ending in three explained picks. */
export function PreferenceFlow() {
  const { preferences, setPreferences, setCompleted } = usePreferences();
  const [step, setStep] = useState(0);
  const [submitting, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const router = useRouter();

  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);

  function update(patch: Partial<Preferences>) {
    setPreferences(current => ({ ...current, ...patch }));
    setCompleted(false);
  }

  function advance() {
    if (submitting || (step === 0 && !dateSelectionComplete(preferences.date))) return;
    if (step < steps.length - 1) setStep(current => current + 1);
    else {
      setCompleted(true);
      startTransition(() => router.push('/match/results'));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); advance(); }
  function skip() {
    if (step === 1) update({ moods: [] });
    if (step === 2) update({ budget: null });
    advance();
  }

  return (
    <div className="page flow">
      <ProgressBar step={step} labels={steps.map(item => item.label)} />
      <form onSubmit={submit} className="flow__form enter">
        <h1 id="step-heading" ref={heading} tabIndex={-1} className="head flow__title" data-reveal>{steps[step].title}</h1>
        <p className="lead muted" data-reveal style={{ '--i': 1 } as React.CSSProperties}>{steps[step].description}</p>

        {step === 0 && <LocationStep preferences={preferences} onChange={update} />}
        {step === 1 && <MoodStep selected={preferences.moods} onChange={moods => update({ moods })} />}
        {step === 2 && (
          <>
            <BudgetStep budget={preferences.budget} onChange={budget => update({ budget })} />
            <details className="flow-review"><summary>Din kväll hittills</summary><MatchSummary preferences={preferences} /></details>
          </>
        )}

        <div className="flow__actions" data-reveal style={{ '--i': 3 } as React.CSSProperties}>
          {step === 0
            ? <Link className="btn btn--ghost" href="/"><ArrowLeft size={18} aria-hidden="true" />Till event</Link>
            : <Button variant="secondary" onClick={() => setStep(current => current - 1)} disabled={submitting}><ArrowLeft size={18} aria-hidden="true" />Tillbaka</Button>}
          <Button type="submit" disabled={submitting || (step === 0 && !dateSelectionComplete(preferences.date))}>
            {submitting ? 'Öppnar…' : step === 2 ? 'Visa mina matchningar' : 'Fortsätt'}<ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
        {step > 0 && <button type="button" className="flow__skip" onClick={skip} disabled={submitting}>{step === 1 ? 'Hoppa över, jag är öppen för allt' : 'Hoppa över, ingen prisgräns'}</button>}
      </form>
    </div>
  );
}
