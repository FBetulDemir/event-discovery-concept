'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import type { Plan } from '@/lib/plans/api';

/** Organizer only: rename the plan and say which day it is for. */
export function PlanSettings({ plan, busy, onSave }: { plan: Plan; busy: boolean; onSave: (title: string, date: string | null) => void }) {
  const [title, setTitle] = useState(plan.title);
  const [date, setDate] = useState(plan.planDate ?? '');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) onSave(title.trim(), date || null);
  }

  return (
    <details className="plan-settings">
      <summary className="btn btn--ghost">Ändra namn och datum</summary>
      <form className="plan-form" onSubmit={submit}>
        <Field label="Namn på planen" value={title} onChange={event => setTitle(event.target.value)} maxLength={80} required />
        <Field label="Vilken dag gäller planen?" type="date" value={date} onChange={event => setDate(event.target.value)} hint="Valfritt. Visas för alla i planen." />
        <Button type="submit" disabled={busy || !title.trim()}>Spara</Button>
      </form>
    </details>
  );
}
