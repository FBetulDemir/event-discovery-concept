'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Check, Copy, Lock, Share2 } from 'lucide-react';
import { outcomeOf, tallyVotes } from '@/lib/voting';
import { rememberedName } from '@/lib/plans/displayName';
import type { PlanError } from '@/lib/plans/api';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { BackLink } from '@/components/ui/BackLink';
import { BackendNotice } from './BackendNotice';
import { VotingCard } from './VotingCard';
import { WinnerCard } from './WinnerCard';
import { usePlanRoom } from './usePlanRoom';

const ERROR_TEXT: Partial<Record<PlanError['code'], string>> = {
  tie: 'Lika många röster. Välj själv vilket event som vinner.',
  closed: 'Omröstningen är stängd.',
  forbidden: 'Bara arrangören kan göra det.',
  plan_not_found: 'Planen hittades inte.',
  already_decided: 'Planen är redan avgjord.',
  no_events: 'Lägg till minst ett event först.',
};

export function PlanRoom({ code }: { code: string }) {
  const { room, busy, actionError, join, vote, remove, close } = usePlanRoom(code);

  if (room.status === 'unconfigured') return <BackendNotice />;
  if (room.status === 'loading') {
    return <section className="page plan" aria-busy="true"><p role="status">Hämtar planen…</p></section>;
  }
  if (room.status === 'error') {
    return <section className="page plan"><h1 className="head">Något gick fel</h1><p>{room.message}</p><Link href="/plan" className="btn btn--ghost">Till dina planer</Link></section>;
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
  const message = actionError ? (ERROR_TEXT[actionError.code] ?? 'Något gick fel, försök igen.') : null;

  return (
    <section className="page plan enter">
      <BackLink href="/plan" label="Dina planer" className="plan__back" />
      <h1 className="head" data-reveal>{plan.title}</h1>
      <p className="lead muted">{members.length} {members.length === 1 ? 'person är' : 'personer är'} med: {members.map(member => member.displayName).join(', ')}</p>

      {!decided && <InviteBox code={plan.inviteCode} title={plan.title} />}
      {message && <p className="plan-notice" role="alert">{message}</p>}

      {decided && winner && (
        <WinnerCard event={winner.snapshot} votes={tally.find(entry => entry.planEventId === winner.id)?.votes ?? 0} />
      )}

      {events.length === 0 ? (
        <p>Inga event i planen än. <Link href="/#event-list">Hitta något att lägga till</Link></p>
      ) : (
        <div className="voting-grid">
          {events.map(event => (
            <VotingCard
              key={event.id}
              event={event.snapshot}
              votes={tally.find(entry => entry.planEventId === event.id)?.votes ?? 0}
              isMine={myVote === event.id}
              disabled={decided || busy}
              onVote={() => vote(event.id)}
              onRemove={event.addedBy === userId || isOrganizer ? () => remove(event.id) : undefined}
            />
          ))}
        </div>
      )}

      {decided ? (
        <p className="plan-notice"><Lock size={18} aria-hidden="true" /> Omröstningen är stängd.</p>
      ) : isOrganizer ? (
        <div className="plan-organizer">
          {outcome.kind === 'tie' && actionError?.code === 'tie' ? (
            <>
              <p>Lika många röster. Välj vinnare:</p>
              <div className="plan-organizer__ties">
                {outcome.planEventIds.map(id => {
                  const tied = events.find(event => event.id === id);
                  return tied && <Button key={id} variant="secondary" disabled={busy} onClick={() => close(id)}>{tied.snapshot.title}</Button>;
                })}
              </div>
            </>
          ) : (
            <Button disabled={busy || events.length === 0} onClick={() => close()}><Lock size={18} aria-hidden="true" />Stäng omröstningen</Button>
          )}
        </div>
      ) : (
        <p className="small muted">Arrangören stänger omröstningen och utser vinnaren.</p>
      )}
    </section>
  );
}

function InviteBox({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === 'undefined' ? '' : `${window.location.origin}/plan/${code}`;

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
        <Field label="Bjud in vänner med länken" readOnly value={url} onFocus={event => event.currentTarget.select()} />
        <Button variant="secondary" onClick={copy}>
          {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copied ? 'Kopierad' : 'Kopiera'}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button variant="secondary" onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
            <Share2 size={18} aria-hidden="true" />Dela
          </Button>
        )}
      </div>
      <p className="small muted" role="status">{copied ? 'Länken är kopierad.' : ''}</p>
    </div>
  );
}

function JoinPlan({ preview, busy, onJoin }: {
  preview: { title: string; organizerName: string; memberCount: number; status: string } | null;
  busy: boolean;
  onJoin: (name: string) => void;
}) {
  const [name, setName] = useState(() => (typeof window === 'undefined' ? '' : rememberedName()));
  if (!preview) {
    return <section className="page plan"><h1 className="head">Planen hittades inte</h1><p>Länken kan vara fel eller så har planen tagits bort.</p><Link href="/plan" className="btn btn--ghost">Till dina planer</Link></section>;
  }
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) onJoin(name.trim());
  };
  return (
    <section className="page plan join" aria-labelledby="join-title">
      <h1 id="join-title" className="head">{preview.title}</h1>
      <p className="lead">{preview.organizerName} har bjudit in dig. {preview.memberCount} {preview.memberCount === 1 ? 'person är' : 'personer är'} med. Skriv ditt namn så kan du rösta direkt, inget konto behövs.</p>
      <form className="plan-form" onSubmit={submit}>
        <Field label="Ditt namn" value={name} onChange={event => setName(event.target.value)} maxLength={40} autoComplete="given-name" required />
        <Button type="submit" disabled={busy || !name.trim()}>{busy ? 'Går med…' : 'Gå med och rösta'}</Button>
      </form>
    </section>
  );
}
