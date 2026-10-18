'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getExistingUser, isSupabaseConfigured } from '@/lib/supabase/client';
import { listMyPlans, type MyPlan } from '@/lib/plans/api';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tag } from '@/components/ui/Tag';
import { formatPlanDate } from '@/lib/plans/dates';
import { BackendNotice } from './BackendNotice';

export function PlansList() {
  const [plans, setPlans] = useState<MyPlan[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        // Looking at your plans never creates a guest session; no session means no plans yet.
        setPlans((await getExistingUser()) ? await listMyPlans() : []);
      } catch {
        // Say so: an error must not look like "you have no plans".
        setFailed(true);
        setPlans([]);
      }
    })();
  }, []);

  if (!isSupabaseConfigured) return <BackendNotice />;

  return (
    <section className="page plan enter" aria-labelledby="plans-title">
      <h1 id="plans-title" className="head" data-reveal>Dina planer</h1>
      {failed ? (
        <p className="plan-notice" role="alert">Kunde inte hämta dina planer just nu. Ladda om sidan.</p>
      ) : plans === null ? (
        <div aria-busy="true"><Skeleton className="skeleton--row" /><Skeleton className="skeleton--row" /></div>
      ) : plans.length === 0 ? (
        <>
          <p className="lead muted measure">Hitta ett event, välj ”Planera med vänner” och skicka länken. Alla röstar, en vinnare utses.</p>
          <ButtonLink href="/">Hitta något att göra<ArrowUpRight size={18} aria-hidden="true" /></ButtonLink>
        </>
      ) : (
        <ul className="plan-list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
          {plans.map(plan => {
            const when = formatPlanDate(plan.planDate, true);
            const decided = plan.status === 'decided';
            return (
              <li key={plan.id}>
                <Link href={`/plan/${plan.inviteCode}`} className="plan-card">
                  {plan.cover ? <img className="plan-card__cover" src={plan.cover.image} alt="" width={176} height={208} loading="lazy" /> : <span className="plan-card__cover plan-card__cover--empty" aria-hidden="true" />}
                  <span className="plan-card__body">
                    <span className="plan-card__title">{plan.title}</span>
                    <span className="muted">
                      {[when, `${plan.memberCount} ${plan.memberCount === 1 ? 'person' : 'personer'}`, `${plan.eventCount} ${plan.eventCount === 1 ? 'alternativ' : 'alternativ'}`].filter(Boolean).join(', ')}
                    </span>
                    <span className="plan-card__tags">
                      {decided ? <Tag>Avgjord</Tag> : plan.iHaveVoted ? <Tag>Du har röstat</Tag> : plan.eventCount > 0 ? <Tag tone="paper">Din röst saknas</Tag> : <Tag>Inga alternativ än</Tag>}
                      {!decided && <span className="muted small">{plan.votes} {plan.votes === 1 ? 'röst' : 'röster'} hittills</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
