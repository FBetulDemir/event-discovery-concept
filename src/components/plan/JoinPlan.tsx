'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';
import type { PlanPreview } from '@/lib/plans/api';
import { rememberedName } from '@/lib/plans/displayName';
import { formatPrice } from '@/lib/format';
import { formatPlanDate } from '@/lib/plans/dates';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

type Props = { preview: PlanPreview | null; busy: boolean; onJoin: (name: string, favouriteEventId: string | null) => void };

/**
 * What an invited friend sees first: who invited them, who is in, what the options are. They can
 * pick a favourite right here; joining with a name casts that vote. No account needed.
 */
export function JoinPlan({ preview, busy, onJoin }: Props) {
  const t = useTranslations('plan.join');
  const all = useTranslations();
  const locale = useLocale();
  const [name, setName] = useState(() => (typeof window === 'undefined' ? '' : rememberedName()));
  const [favourite, setFavourite] = useState<string | null>(null);
  const [nameMissing, setNameMissing] = useState(false);

  if (!preview) {
    return (
      <section className="page plan">
        <h1 className="head">{t('notFoundTitle')}</h1>
        <p>{t('notFoundBody')}</p>
        <Link href="/plan" className="btn btn--ghost">{all('plan.room.toPlans')}</Link>
      </section>
    );
  }

  const when = formatPlanDate(preview.planDate, locale);
  const closed = preview.status === 'decided';

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setNameMissing(true); return; }
    setNameMissing(false);
    onJoin(name.trim(), favourite);
  }

  return (
    <section className="page plan join enter" aria-labelledby="join-title">
      <h1 id="join-title" className="head">{preview.title}</h1>
      <p className="lead">
        {when ? t('invitedOn', { organizer: preview.organizerName, when }) : t('invited', { organizer: preview.organizerName })}
        {preview.memberNames.length > 0 && t('with', { names: preview.memberNames.join(', ') })}
      </p>

      {preview.events.length > 0 && (
        <fieldset className="pick-list">
          <legend>{closed ? t('optionsClosed') : t('pick')}</legend>
          {preview.events.map(event => (
            <label key={event.id} className={`pick-card${favourite === event.id ? ' is-picked' : ''}`}>
              <input type="radio" name="favourite" className="sr-only" value={event.id} checked={favourite === event.id} disabled={closed}
                onChange={() => setFavourite(event.id)} />
              <img src={event.image} alt="" width={160} height={200} loading="lazy" />
              <span className="pick-card__copy">
                <span className="pick-card__title">{event.title}</span>
                <span className="muted">{event.venue}, {formatPlanDate(event.date, locale, true)} {event.time.slice(0, 5)}</span>
                <span className="muted">{formatPrice(event.price, all)}</span>
              </span>
              <span className="pick-card__mark" aria-hidden="true">{favourite === event.id && <Check size={18} />}</span>
            </label>
          ))}
          <p className="small muted">{t('changeVote')}</p>
        </fieldset>
      )}

      {closed ? (
        <p className="plan-notice">{t('closed')}</p>
      ) : null}

      <form className="plan-form" onSubmit={submit} noValidate>
        <Field label={all('plan.new.yourName')} value={name} onChange={event => { setName(event.target.value); setNameMissing(false); }} maxLength={40} autoComplete="given-name" error={nameMissing ? t('nameRequired') : null} />
        <Button type="submit" disabled={busy}>{busy ? t('joining') : favourite ? t('joinAndVote') : t('join')}</Button>
        <p className="small muted">{t('noAccount')}</p>
      </form>
    </section>
  );
}
