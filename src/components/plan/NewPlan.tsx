'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCatalog } from '@/lib/useEvents';
import { getExistingUser, isSupabaseConfigured, ensureUser } from '@/lib/supabase/client';
import { addEventToPlan, createPlan, listMyPlans, type MyPlan } from '@/lib/plans/api';
import { rememberedName, rememberName } from '@/lib/plans/displayName';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { BackendNotice } from './BackendNotice';

export function NewPlan() {
  const router = useRouter();
  const eventId = useSearchParams().get('event');
  const { events, loading } = useCatalog();
  const event = events.find(candidate => candidate.id === eventId);

  const [title, setTitle] = useState('Kväll ut');
  const [name, setName] = useState('');
  const [openPlans, setOpenPlans] = useState<MyPlan[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setName(rememberedName());
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        if (await getExistingUser()) setOpenPlans((await listMyPlans()).filter(plan => plan.status === 'open'));
      } catch {
        // No plans to offer; creating a new one still works.
      }
    })();
  }, []);

  if (!isSupabaseConfigured) return <BackendNotice />;

  async function create(submitted: FormEvent) {
    submitted.preventDefault();
    setBusy(true);
    setFailed(false);
    try {
      rememberName(name.trim());
      const plan = await createPlan(title.trim(), name.trim(), event);
      router.push(`/plan/${plan.inviteCode}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  async function addTo(plan: MyPlan) {
    if (!event) return;
    setBusy(true);
    setFailed(false);
    try {
      const user = await ensureUser();
      await addEventToPlan(plan.id, event, user.id);
      router.push(`/plan/${plan.inviteCode}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <section className="plan-page" aria-labelledby="new-plan-title">
      <Link href={event ? `/events/${encodeURIComponent(event.id)}` : '/'} className="text-link"><ArrowLeft size={17} aria-hidden="true" />Tillbaka</Link>
      <h1 id="new-plan-title">Ny plan</h1>
      {event ? (
        <p className="plan-page__intro">{event.title} · {event.venue} · {formatPrice(event.price)}</p>
      ) : loading ? (
        <p role="status">Hämtar eventet…</p>
      ) : (
        <p className="plan-page__intro">Skapa en plan och lägg till event efteråt.</p>
      )}

      <form className="plan-form" onSubmit={create}>
        <label htmlFor="plan-title">Namn på planen</label>
        <input id="plan-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} required />
        <label htmlFor="plan-name">Ditt namn</label>
        <input id="plan-name" value={name} onChange={e => setName(e.target.value)} maxLength={40} autoComplete="given-name" required />
        <Button type="submit" disabled={busy || !title.trim() || !name.trim()}>{busy ? 'Skapar…' : 'Skapa plan'}</Button>
      </form>
      {failed && <p className="plan-notice" role="alert">Det gick inte att spara. Försök igen.</p>}

      {event && openPlans.length > 0 && (
        <section aria-labelledby="existing-title">
          <h2 id="existing-title">Eller lägg till i en pågående plan</h2>
          <ul className="plan-list">
            {openPlans.map(plan => (
              <li key={plan.id}>
                <button type="button" className="plan-list__item" disabled={busy} onClick={() => addTo(plan)}>
                  <span className="plan-list__title">{plan.title}</span>
                  <span className="plan-list__meta">{plan.memberCount} {plan.memberCount === 1 ? 'person' : 'personer'}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
