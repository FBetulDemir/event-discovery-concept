'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useCatalog } from '@/lib/useEvents';
import { getExistingUser, isSupabaseConfigured, ensureUser } from '@/lib/supabase/client';
import { addEventToPlan, createPlan, listMyPlans, type MyPlan } from '@/lib/plans/api';
import { rememberedName, rememberName } from '@/lib/plans/displayName';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { BackLink } from '@/components/ui/BackLink';
import { Field } from '@/components/ui/Field';
import { BackendNotice } from './BackendNotice';

export function NewPlan() {
  const router = useRouter();
  const t = useTranslations('plan.new');
  const all = useTranslations();
  const search = useSearchParams();
  const eventId = search.get('event');
  const { events, loading } = useCatalog();
  const event = events.find(candidate => candidate.id === eventId);

  const [title, setTitle] = useState(search.get('title') ?? t('defaultTitle'));
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
    <section className="page plan enter" aria-labelledby="new-plan-title">
      <BackLink href={event ? `/events/${encodeURIComponent(event.id)}` : '/'} label={all('common.back')} className="plan__back" />
      <h1 id="new-plan-title" className="head" data-reveal>{t('title')}</h1>
      {event ? (
        <p className="lead muted">{event.title}, {event.venue}, {formatPrice(event.price, all)}</p>
      ) : loading ? (
        <p role="status">{t('loadingEvent')}</p>
      ) : (
        <p className="lead muted">{t('lead')}</p>
      )}

      <form className="plan-form" onSubmit={create} data-reveal style={{ '--i': 1 } as React.CSSProperties}>
        <Field label={t('titleLabel')} value={title} onChange={e => setTitle(e.target.value)} maxLength={80} required />
        <Field label={t('yourName')} value={name} onChange={e => setName(e.target.value)} maxLength={40} autoComplete="given-name" required />
        <Button type="submit" disabled={busy || !title.trim() || !name.trim()}>{busy ? t('creating') : t('create')}</Button>
      </form>
      {failed && <p className="plan-notice" role="alert">{t('failed')}</p>}

      {event && openPlans.length > 0 && (
        <section aria-labelledby="existing-title">
          <h2 id="existing-title" className="lead">{t('addToExisting')}</h2>
          <ul className="plan-list">
            {openPlans.map(plan => (
              <li key={plan.id}>
                <button type="button" className="plan-list__item" disabled={busy} onClick={() => addTo(plan)}>
                  <span className="plan-list__title">{plan.title}</span>
                  <span className="plan-list__meta muted">{all('plan.list.people', { count: plan.memberCount })}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
