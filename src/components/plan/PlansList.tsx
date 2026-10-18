'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users } from 'lucide-react';
import { getExistingUser, isSupabaseConfigured } from '@/lib/supabase/client';
import { listMyPlans, type MyPlan } from '@/lib/plans/api';
import { BackendNotice } from './BackendNotice';

export function PlansList() {
  const [plans, setPlans] = useState<MyPlan[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        // Looking at your plans never creates a guest session; no session means no plans yet.
        setPlans((await getExistingUser()) ? await listMyPlans() : []);
      } catch {
        setPlans([]);
      }
    })();
  }, []);

  if (!isSupabaseConfigured) return <BackendNotice />;

  return (
    <section className="plan-page" aria-labelledby="plans-title">
      <p className="eyebrow"><Users size={16} aria-hidden="true" /> Planera med vänner</p>
      <h1 id="plans-title">Dina planer</h1>
      {plans === null ? (
        <p role="status">Hämtar dina planer…</p>
      ) : plans.length === 0 ? (
        <>
          <p className="plan-page__intro">Hitta ett event, välj ”Planera med vänner” och skicka länken. Alla röstar, en vinnare utses.</p>
          <Link href="/" className="button button--primary">Hitta något att göra<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </>
      ) : (
        <ul className="plan-list">
          {plans.map(plan => (
            <li key={plan.id}>
              <Link href={`/plan/${plan.inviteCode}`} className="plan-list__item">
                <span className="plan-list__title">{plan.title}</span>
                <span className="plan-list__meta">{plan.memberCount} {plan.memberCount === 1 ? 'person' : 'personer'} · {plan.status === 'decided' ? 'Avgjord' : 'Pågår'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
