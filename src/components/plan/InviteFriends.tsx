'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';
import { inviteFriend, loadFriends, type Friend } from '@/lib/social/api';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/Button';

/** Invite accepted friends straight into the plan. Accounts only; guests share the link instead. */
export function InviteFriends({ planId, memberIds }: { planId: string; memberIds: string[] }) {
  const auth = useAuth();
  const t = useTranslations('plan.inviteFriends');
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
    return <p className="small muted">{t.rich('none', { link: chunks => <Link href="/vanner">{chunks}</Link> })}</p>;
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
      <h2 id="invite-friends-title" className="lead">{t('title')}</h2>
      <ul>
        {candidates.map(friend => (
          <li key={friend.userId} className="friend-row">
            <span className="friend-row__name">{friend.displayName}</span>
            <span className="friend-row__actions">
              {invited.has(friend.userId)
                ? <span className="muted"><Check size={18} aria-hidden="true" /> {t('invited')}</span>
                : <Button variant="secondary" disabled={busy === friend.userId} onClick={() => invite(friend)}>{t('invite')}</Button>}
            </span>
          </li>
        ))}
      </ul>
      {failed && <p className="plan-notice" role="alert">{t('failed')}</p>}
    </section>
  );
}
