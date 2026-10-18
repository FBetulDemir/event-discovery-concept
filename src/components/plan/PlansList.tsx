'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getExistingUser, isSupabaseConfigured } from '@/lib/supabase/client';
import { listMyPlans, type MyPlan } from '@/lib/plans/api';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
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
    <section className="page plan enter" aria-labelledby="plans-title">
      <h1 id="plans-title" className="head" data-reveal>Dina planer</h1>
      {plans === null ? (
        <div aria-busy="true"><Skeleton className="skeleton--row" /><Skeleton className="skeleton--row" /></div>
      ) : plans.length === 0 ? (
        <>
          <p className="lead muted measure">Hitta ett event, välj ”Planera med vänner” och skicka länken. Alla röstar, en vinnare utses.</p>
          <ButtonLink href="/">Hitta något att göra<ArrowUpRight size={18} aria-hidden="true" /></ButtonLink>
        </>
      ) : (
        <ul className="plan-list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
          {plans.map(plan => (
            <li key={plan.id}>
              <Link href={`/plan/${plan.inviteCode}`} className="plan-list__item">
                <span className="plan-list__title">{plan.title}</span>
                <span className="plan-list__meta muted">{plan.memberCount} {plan.memberCount === 1 ? 'person' : 'personer'}, {plan.status === 'decided' ? 'avgjord' : 'pågår'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
