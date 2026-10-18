'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
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
  const [name, setName] = useState(() => (typeof window === 'undefined' ? '' : rememberedName()));
  const [favourite, setFavourite] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!preview) {
    return (
      <section className="page plan">
        <h1 className="head">Planen hittades inte</h1>
        <p>Länken kan vara fel eller så har planen tagits bort.</p>
        <Link href="/plan" className="btn btn--ghost">Till dina planer</Link>
      </section>
    );
  }

  const when = formatPlanDate(preview.planDate);
  const closed = preview.status === 'decided';

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError('Skriv ditt namn så vet gänget vem du är.'); return; }
    setError(null);
    onJoin(name.trim(), favourite);
  }

  return (
    <section className="page plan join enter" aria-labelledby="join-title">
      <h1 id="join-title" className="head">{preview.title}</h1>
      <p className="lead">
        {preview.organizerName} har bjudit in dig{when ? ` till ${when}` : ''}.
        {preview.memberNames.length > 0 && ` Med: ${preview.memberNames.join(', ')}.`}
      </p>

      {preview.events.length > 0 && (
        <fieldset className="pick-list">
          <legend>{closed ? 'Alternativen' : 'Vad vill du göra? Välj din favorit.'}</legend>
          {preview.events.map(event => (
            <label key={event.id} className={`pick-card${favourite === event.id ? ' is-picked' : ''}`}>
              <input type="radio" name="favourite" className="sr-only" value={event.id} checked={favourite === event.id} disabled={closed}
                onChange={() => setFavourite(event.id)} />
              <img src={event.image} alt="" width={160} height={200} loading="lazy" />
              <span className="pick-card__copy">
                <span className="pick-card__title">{event.title}</span>
                <span className="muted">{event.venue}, {formatPlanDate(event.date, true)} {event.time.slice(0, 5)}</span>
                <span className="muted">{formatPrice(event.price)}</span>
              </span>
              <span className="pick-card__mark" aria-hidden="true">{favourite === event.id && <Check size={18} />}</span>
            </label>
          ))}
          <p className="small muted">Du kan ändra din röst när du är med.</p>
        </fieldset>
      )}

      {closed ? (
        <p className="plan-notice">Planen är avgjord. Du kan ändå gå med och se vem som vann.</p>
      ) : null}

      <form className="plan-form" onSubmit={submit} noValidate>
        <Field label="Ditt namn" value={name} onChange={event => { setName(event.target.value); setError(null); }} maxLength={40} autoComplete="given-name" error={error} />
        <Button type="submit" disabled={busy}>{busy ? 'Går med…' : favourite ? 'Gå med och rösta' : 'Gå med'}</Button>
        <p className="small muted">Inget konto behövs. Du kan spara dina planer med en e-postadress senare.</p>
      </form>
    </section>
  );
}
