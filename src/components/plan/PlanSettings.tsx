'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import type { Plan } from '@/lib/plans/api';

/** Organizer only: rename the plan and say which day it is for. */
export function PlanSettings({ plan, busy, onSave }: { plan: Plan; busy: boolean; onSave: (title: string, date: string | null) => void }) {
  const t = useTranslations('plan');
  const [title, setTitle] = useState(plan.title);
  const [date, setDate] = useState(plan.planDate ?? '');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) onSave(title.trim(), date || null);
  }

  return (
    <details className="plan-settings">
      <summary className="btn btn--ghost">{t('settings.summary')}</summary>
      <form className="plan-form" onSubmit={submit}>
        <Field label={t('new.titleLabel')} value={title} onChange={event => setTitle(event.target.value)} maxLength={80} required />
        <Field label={t('settings.day')} type="date" value={date} onChange={event => setDate(event.target.value)} hint={t('settings.dayHint')} />
        <Button type="submit" disabled={busy || !title.trim()}>{t('settings.save')}</Button>
      </form>
    </details>
  );
}
