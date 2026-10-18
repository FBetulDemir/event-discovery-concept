'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, getPathname } from '@/i18n/navigation';
import { Check, Copy, Lock, Share2 } from 'lucide-react';
import { outcomeOf, tallyVotes } from '@/lib/voting';
import { formatPlanDate } from '@/lib/plans/dates';
import { formatPricePerPerson } from '@/lib/format';
import type { PlanError } from '@/lib/plans/api';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { BackLink } from '@/components/ui/BackLink';
import { CommentThread } from '@/components/comments/CommentThread';
import { BackendNotice } from './BackendNotice';
import { VotingCard } from './VotingCard';
import { WinnerCard } from './WinnerCard';
import { PlanMembers } from './PlanMembers';
import { PlanSettings } from './PlanSettings';
import { AddEventPanel } from './AddEventPanel';
import { InviteFriends } from './InviteFriends';
import { JoinPlan } from './JoinPlan';
import { usePlanRoom } from './usePlanRoom';

const KNOWN_ERRORS = ['tie', 'closed', 'forbidden', 'plan_not_found', 'already_decided', 'no_events'] as const satisfies readonly PlanError['code'][];

export function PlanRoom({ code }: { code: string }) {
  const { room, busy, actionError, join, vote, remove, close, addEvent, savePlan } = usePlanRoom(code);
  const t = useTranslations('plan');
  const all = useTranslations();
  const locale = useLocale();

  if (room.status === 'unconfigured') return <BackendNotice />;
  if (room.status === 'loading') {
    return <section className="page plan" aria-busy="true"><p role="status">{t('room.loading')}</p></section>;
  }
  if (room.status === 'error') {
    return <section className="page plan"><h1 className="head">{t('room.errorTitle')}</h1><p>{t('room.errorBody')}</p><Link href="/plan" className="btn btn--ghost">{t('room.toPlans')}</Link></section>;
  }
  if (room.status === 'preview') {
    return <JoinPlan preview={room.preview} busy={busy} onJoin={join} />;
  }

  const { state, userId } = room;
  const { plan, members, events, votes } = state;
  const isOrganizer = plan.organizerId === userId;
  const decided = plan.status === 'decided';
  const tally = tallyVotes(events.map(event => event.id), votes);
  const outcome = outcomeOf(tally);
  const myVote = votes.find(vote => vote.userId === userId)?.planEventId ?? null;
  const winner = events.find(event => event.id === plan.decidedPlanEventId);
  const nameOf = (id: string) => members.find(member => member.userId === id)?.displayName ?? '?';
  const votersOf = (eventId: string) => votes.filter(vote => vote.planEventId === eventId).map(vote => nameOf(vote.userId));
  const known = actionError ? KNOWN_ERRORS.find(code => code === actionError.code) : undefined;
  const message = actionError ? (known ? t(`errors.${known}`) : all('common.generic')) : null;
  const when = formatPlanDate(plan.planDate, locale);
  const notVoted = members.filter(member => !votes.some(vote => vote.userId === member.userId)).length;

  return (
    <section className="page plan enter">
      <BackLink href="/plan" label={t('room.yourPlans')} className="plan__back" />
      <h1 className="head" data-reveal>{plan.title}</h1>
      <p className="lead muted">
        {when ?? t('room.noDate')}, {t('list.people', { count: members.length })}
        {!decided && notVoted > 0 && `, ${t('room.notVoted', { count: notVoted })}`}
      </p>

      <PlanMembers members={members} votes={votes} showVotes={!decided} />

      {!decided && <InviteBox code={plan.inviteCode} title={plan.title} />}
      {!decided && <InviteFriends planId={plan.id} memberIds={members.map(member => member.userId)} />}
      {isOrganizer && !decided && <PlanSettings key={`${plan.title}|${plan.planDate}`} plan={plan} busy={busy} onSave={savePlan} />}
      {message && <p className="plan-notice" role="alert">{message}</p>}

      {decided && winner && (
        <>
          <WinnerCard event={winner.snapshot} votes={tally.find(entry => entry.planEventId === winner.id)?.votes ?? 0} />
          <ShareResult title={plan.title} when={when} event={winner.snapshot} />
        </>
      )}

      {events.length === 0 ? (
        <p>{t.rich('room.noEvents', { link: chunks => <Link href="/#event-list">{chunks}</Link> })}</p>
      ) : decided ? (
        <section aria-labelledby="results-heading" className="plan-results">
          <h2 id="results-heading" className="lead">{t('room.resultsTitle')}</h2>
          <ul>
            {tally.map(entry => {
              const event = events.find(candidate => candidate.id === entry.planEventId)!;
              return (
                <li key={entry.planEventId} className={entry.planEventId === plan.decidedPlanEventId ? 'is-winner' : ''}>
                  <span className="plan-results__title">{event.snapshot.title}</span>
                  <span className="muted">{t('room.votes', { count: entry.votes })}{votersOf(event.id).length ? `: ${votersOf(event.id).join(', ')}` : ''}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <div className="voting-grid">
          {events.map(event => (
            <VotingCard
              key={event.id}
              event={event.snapshot}
              votes={tally.find(entry => entry.planEventId === event.id)?.votes ?? 0}
              voters={votersOf(event.id)}
              isMine={myVote === event.id}
              disabled={busy}
              onVote={() => vote(event.id)}
              onRemove={event.addedBy === userId || isOrganizer ? () => remove(event.id) : undefined}
            />
          ))}
        </div>
      )}

      {!decided && (
        <AddEventPanel existing={new Set(events.map(event => event.snapshot.id))} busy={busy} onAdd={addEvent} />
      )}

      {decided ? (
        <p className="plan-notice"><Lock size={18} aria-hidden="true" /> {t('room.closedNote')}</p>
      ) : isOrganizer ? (
        <div className="plan-organizer">
          {outcome.kind === 'tie' && actionError?.code === 'tie' ? (
            <>
              <p>{t('room.tieChoose')}</p>
              <div className="plan-organizer__ties">
                {outcome.planEventIds.map(id => {
                  const tied = events.find(event => event.id === id);
                  return tied && <Button key={id} variant="secondary" disabled={busy} onClick={() => close(id)}>{tied.snapshot.title}</Button>;
                })}
              </div>
            </>
          ) : (
            <Button disabled={busy || events.length === 0} onClick={() => close()}><Lock size={18} aria-hidden="true" />{t('room.close')}</Button>
          )}
        </div>
      ) : (
        <p className="small muted">{t('room.waitOrganizer')}</p>
      )}

      <CommentThread target={{ type: 'plan', id: plan.id }} organizerId={plan.organizerId} title={t('room.commentsTitle')} />
    </section>
  );
}

function InviteBox({ code, title }: { code: string; title: string }) {
  const t = useTranslations('plan.invite');
  const [copied, setCopied] = useState(false);
  const locale = useLocale();
  // The invite carries the sender's language: an English plan room shares /en/plan/<code>.
  const url = typeof window === 'undefined' ? '' : `${window.location.origin}${getPathname({ href: `/plan/${code}`, locale })}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link is also selectable in the field.
    }
  }

  return (
    <div className="invite-box" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
      <div className="invite-box__row">
        <Field label={t('label')} readOnly value={url} onFocus={event => event.currentTarget.select()} />
        <Button variant="secondary" onClick={copy}>
          {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copied ? t('copied') : t('copy')}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button variant="secondary" onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
            <Share2 size={18} aria-hidden="true" />{t('share')}
          </Button>
        )}
      </div>
      <p className="small muted" role="status">{copied ? t('copiedStatus') : ''}</p>
    </div>
  );
}

/** A message you can paste into the group chat once the plan is decided. */
function ShareResult({ title, when, event }: { title: string; when: string | null; event: { title: string; venue: string; date: string; time: string; price: number | null; ticketUrl: string | null } }) {
  const t = useTranslations('plan.share');
  const all = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const text = t('text', { title, event: event.title, venue: event.venue, when: formatPlanDate(event.date, locale) ?? when ?? '', time: event.time.slice(0, 5), price: formatPricePerPerson(event.price, all) })
    + (event.ticketUrl ? t('tickets', { url: event.ticketUrl }) : '');

  return (
    <div className="plan-organizer">
      <Button variant="secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
      }}>
        {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
        {copied ? t('copied') : t('button')}
      </Button>
    </div>
  );
}
