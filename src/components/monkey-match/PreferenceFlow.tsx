'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, AudioLines, Check, Users } from 'lucide-react';
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
  { label: 'När & var', title: 'Var börjar din kväll?', description: 'En plats och en dag. Resten hittar vi tillsammans.' },
  { label: 'Din känsla', title: 'Vad är du sugen på?', description: 'Dansgolv eller skönt häng? Det finns inget fel svar.' },
  { label: 'Din budget', title: 'Vad får kvällen kosta?', description: 'Hitta något som känns rätt, även för plånboken.' },
] as const;

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
      startTransition(() => router.push('/matches'));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); advance(); }
  function skip() {
    if (step === 1) update({ moods: [] });
    if (step === 2) update({ budget: null });
    advance();
  }

  return (
    <div className="match-layout">
      <aside className="match-story" aria-labelledby="match-intro-heading">
        <p className="eyebrow"><AudioLines size={18} aria-hidden="true" /> MONKEY MATCH</p>
        <h2 id="match-intro-heading">Mindre scroll.<br /><span>Mer kväll.</span></h2>
        <p>Berätta vad du gillar. Hitta en kväll som känns som du.</p>
        <div className="match-story__image"><img src="/images/hero.jpg" width={600} height={400} alt="Vänner i en konsertpublik framför en upplyst scen" /><span><Users size={16} aria-hidden="true" /> Bättre tillsammans.</span></div>
        <ol className="match-journey"><li><Check size={16} aria-hidden="true" />Välj din vibe</li><li><span>2</span>Hitta dina matchningar</li><li><span>3</span>Låt kompisarna rösta</li></ol>
        <p className="match-story__note">Din kväll börjar här. Vem följer med?</p>
      </aside>
      <section className="flow-panel" aria-labelledby="step-heading">
        <ProgressBar step={step} labels={steps.map(item => item.label)} />
        <form onSubmit={submit}>
          <div className="flow-heading">
            <p className="eyebrow">STEG {step + 1} AV {steps.length}</p>
            <h1 id="step-heading" ref={heading} tabIndex={-1}>{steps[step].title}</h1>
            <p>{steps[step].description}</p>
          </div>
          {step === 0 && <LocationStep preferences={preferences} onChange={update} />}
          {step === 1 && <MoodStep selected={preferences.moods} onChange={moods => update({ moods })} />}
          {step === 2 && <><BudgetStep budget={preferences.budget} onChange={budget => update({ budget })} /><details className="flow-review"><summary>Din kväll hittills</summary><MatchSummary preferences={preferences} /></details></>}
          <div className="flow-actions">
            {step === 0 ? <Link className="flow-back" href="/"><ArrowLeft size={17} aria-hidden="true" />Till event</Link> : <Button variant="secondary" onClick={() => setStep(current => current - 1)} disabled={submitting}><ArrowLeft size={17} aria-hidden="true" />Tillbaka</Button>}
            <Button type="submit" disabled={submitting || (step === 0 && !dateSelectionComplete(preferences.date))}>{submitting ? 'Öppnar…' : step === 2 ? 'Visa mina matchningar' : 'Fortsätt'}<ArrowRight size={17} aria-hidden="true" /></Button>
          </div>
          {step > 0 && <button type="button" className="flow-skip" onClick={skip} disabled={submitting}>{step === 1 ? 'Hoppa över – jag är öppen för allt' : 'Hoppa över – ingen prisgräns'}</button>}
        </form>
        <p className="flow-prototype-note">Designprototyp · Datum och event är fiktiva exempel.</p>
      </section>
    </div>
  );
}
