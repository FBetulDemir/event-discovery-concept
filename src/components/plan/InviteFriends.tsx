'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { inviteFriend, loadFriends, type Friend } from '@/lib/social/api';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/Button';

/** Invite accepted friends straight into the plan. Accounts only; guests share the link instead. */
export function InviteFriends({ planId, memberIds }: { planId: string; memberIds: string[] }) {
  const auth = useAuth();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const isAccount = auth.status === 'account';

  useEffect(() => {
    if (!isAccount) return;
    loadFriends().then(rows => setFriends(rows.filter(row => row.relation === 'friend')), () => setFriends([]));
  }, [isAccount]);

  if (!isAccount || friends === null) return null;
  const candidates = friends.filter(friend => !memberIds.includes(friend.userId));
  if (friends.length === 0) {
    return <p className="small muted">Har du vänner i Gänget kan du bjuda in dem direkt. <Link href="/vanner">Lägg till vänner</Link></p>;
  }
  if (candidates.length === 0) return null;

  async function invite(friend: Friend) {
    setBusy(friend.userId); setFailed(false);
    try {
      await inviteFriend(planId, friend.userId);
      setInvited(previous => new Set(previous).add(friend.userId));
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="friend-group" aria-labelledby="invite-friends-title">
      <h2 id="invite-friends-title" className="lead">Bjud in vänner</h2>
      <ul>
        {candidates.map(friend => (
          <li key={friend.userId} className="friend-row">
            <span className="friend-row__name">{friend.displayName}</span>
            <span className="friend-row__actions">
              {invited.has(friend.userId)
                ? <span className="muted"><Check size={18} aria-hidden="true" /> Inbjuden</span>
                : <Button variant="secondary" disabled={busy === friend.userId} onClick={() => invite(friend)}>Bjud in</Button>}
            </span>
          </li>
        ))}
      </ul>
      {failed && <p className="plan-notice" role="alert">Kunde inte skicka inbjudan, försök igen.</p>}
    </section>
  );
}
