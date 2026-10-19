'use client';

import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { getExistingUser, isSupabaseConfigured } from '@/lib/supabase/client';
import { listMyPlans, type MyPlan } from '@/lib/plans/api';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tag } from '@/components/ui/Tag';
import { formatPlanDate } from '@/lib/plans/dates';
import { acceptInvite, declineInvite, describeNews, hasNews } from '@/lib/social/api';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import { Button } from '@/components/ui/Button';
import { BackendNotice } from './BackendNotice';

export function PlansList() {
  const [plans, setPlans] = useState<MyPlan[] | null>(null);
  const [failed, setFailed] = useState(false);
  const { unread, invites, refresh } = useNotifications();
  const t = useTranslations('plan.list');
  const all = useTranslations();
  const locale = useLocale();

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
      <h1 id="plans-title" className="head" data-reveal>{t('title')}</h1>
      {failed ? (
        <p className="plan-notice" role="alert">{t('failed')}</p>
      ) : plans === null ? (
        <div aria-busy="true"><Skeleton className="skeleton--row" /><Skeleton className="skeleton--row" /></div>
      ) : plans.length === 0 ? (
        <>
          <Invitations invites={invites} onChanged={refresh} />
          <p className="lead muted measure">{t('emptyLead')}</p>
          <ButtonLink href="/">{t('findSomething')}<ArrowUpRight size={18} aria-hidden="true" /></ButtonLink>
        </>
      ) : (
        <>
        <Invitations invites={invites} onChanged={refresh} />
        <ul className="plan-list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
          {plans.map(plan => {
            const news = describeNews(unread.get(plan.id), all);
            const when = formatPlanDate(plan.planDate, locale, true);
            const decided = plan.status === 'decided';
            return (
              <li key={plan.id}>
                <Link href={`/plan/${plan.inviteCode}`} className="plan-card">
                  {plan.cover ? <img className="plan-card__cover" src={plan.cover.image} alt="" width={176} height={208} loading="lazy" /> : <span className="plan-card__cover plan-card__cover--empty" aria-hidden="true" />}
                  <span className="plan-card__body">
                    <span className="plan-card__title">{plan.title}</span>
                    <span className="muted">
                      {[when, t('people', { count: plan.memberCount }), t('options', { count: plan.eventCount })].filter(Boolean).join(', ')}
                    </span>
                    <span className="plan-card__tags">
                      {decided ? <Tag>{t('decided')}</Tag> : plan.iHaveVoted ? <Tag>{t('youVoted')}</Tag> : plan.eventCount > 0 ? <Tag tone="paper">{t('voteMissing')}</Tag> : <Tag>{t('noOptions')}</Tag>}
                      {!decided && <span className="muted small">{t('votesSoFar', { count: plan.votes })}</span>}
                    </span>
                    {hasNews(unread.get(plan.id)) && <span className="plan-card__news">{t('news', { news: news ?? '' })}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        </>
      )}
    </section>
  );
}

function Invitations({ invites, onChanged }: { invites: ReturnType<typeof useNotifications>['invites']; onChanged: () => Promise<void> }) {
  const router = useRouter();
  const t = useTranslations('plan.invitations');
  const all = useTranslations();
  const locale = useLocale();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  if (invites.length === 0) return null;

  async function respond(planId: string, accept: boolean) {
    setBusy(planId); setFailed(false);
    try {
      if (accept) router.push(`/plan/${await acceptInvite(planId)}`);
      else await declineInvite(planId);
      await onChanged();
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="invitations" aria-labelledby="invitations-title">
      <h2 id="invitations-title" className="lead">{t('title')}</h2>
      <ul>
        {invites.map(invite => (
          <li key={invite.planId}>
            <span className="invitations__text">
              <strong>{invite.planTitle}</strong>
              <span className="muted">{invite.planDate ? t('textDated', { from: invite.fromName, date: formatPlanDate(invite.planDate, locale, true) ?? '', options: all('plan.list.options', { count: invite.eventCount }) }) : t('text', { from: invite.fromName, options: all('plan.list.options', { count: invite.eventCount }) })}</span>
            </span>
            <span className="invitations__actions">
              <Button disabled={busy === invite.planId} onClick={() => respond(invite.planId, true)}>{t('join')}</Button>
              <Button variant="ghost" disabled={busy === invite.planId} onClick={() => respond(invite.planId, false)}>{t('decline')}</Button>
            </span>
          </li>
        ))}
      </ul>
      {failed && <p className="plan-notice" role="alert">{all('common.generic')}</p>}
    </section>
  );
}
