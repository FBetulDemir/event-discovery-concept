'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  addFriend, friendPreview, loadFriends, myFriendCode, removeFriend, respondFriend, setDisplayName, SocialError,
  parseFriendCode, type AddFriendResult, type Friend,
} from '@/lib/social/api';
import { useAuth } from '@/lib/useAuth';
import { rememberedName } from '@/lib/plans/displayName';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackendNotice } from '@/components/plan/BackendNotice';
import { useNotifications } from '@/components/notifications/NotificationsProvider';

const RESULT_TEXT: Record<AddFriendResult, string> = {
  requested: 'Vänförfrågan skickad.',
  accepted: 'Ni är vänner nu.',
  already_friends: 'Ni är redan vänner.',
  already_requested: 'Du har redan skickat en förfrågan.',
};

const ERROR_TEXT: Record<string, string> = {
  friend_not_found: 'Ingen hittades med den koden.',
  cannot_add_self: 'Det är din egen kod.',
  display_name_required: 'Välj ett namn först.',
};

export function FriendsPanel() {
  const auth = useAuth();
  const { refresh } = useNotifications();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [entered, setEntered] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [incoming, setIncoming] = useState<{ code: string; name: string } | null>(null);

  const isAccount = auth.status === 'account';

  const reload = useCallback(async () => {
    try {
      setFriends(await loadFriends());
      try { setCode(await myFriendCode()); setNeedsName(false); }
      catch (cause) { if (cause instanceof SocialError && cause.code === 'display_name_required') setNeedsName(true); else throw cause; }
      await refresh();
    } catch {
      setFriends([]);
      setError('Kunde inte hämta dina vänner just nu.');
    }
  }, [refresh]);

  useEffect(() => {
    if (!isAccount) return;
    setNameInput(rememberedName());
    void reload();
  }, [isAccount, reload]);

  // A friend link (`/vanner?kod=…`) shows who it belongs to before anything is sent.
  useEffect(() => {
    if (!isAccount) return;
    const shared = new URLSearchParams(window.location.search).get('kod');
    if (!shared) return;
    friendPreview(shared).then(who => who && setIncoming({ code: shared, name: who.displayName }), () => undefined);
  }, [isAccount]);

  async function run(action: () => Promise<string | void>) {
    setBusy(true); setError(null); setMessage(null);
    try {
      const text = await action();
      if (text) setMessage(text);
      await reload();
    } catch (cause) {
      setError(cause instanceof SocialError ? (ERROR_TEXT[cause.code] ?? 'Något gick fel, försök igen.') : 'Något gick fel, försök igen.');
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) return <BackendNotice />;
  if (auth.status === 'loading') return <section className="page plan" aria-busy="true"><Skeleton className="skeleton--row" /></section>;

  if (!isAccount) {
    return (
      <section className="page plan enter" aria-labelledby="friends-title">
        <h1 id="friends-title" className="head">Vänner</h1>
        <p className="lead muted measure">Vänner kräver ett konto, så att listan finns kvar nästa gång. Det tar en halv minut.</p>
        <ButtonLink href="/konto">Skapa konto eller logga in</ButtonLink>
      </section>
    );
  }

  const link = code && typeof window !== 'undefined' ? `${window.location.origin}/vanner?kod=${code}` : '';
  const requests = friends?.filter(friend => friend.relation === 'incoming') ?? [];
  const sent = friends?.filter(friend => friend.relation === 'outgoing') ?? [];
  const accepted = friends?.filter(friend => friend.relation === 'friend') ?? [];

  return (
    <section className="page plan enter" aria-labelledby="friends-title">
      <h1 id="friends-title" className="head" data-reveal>Vänner</h1>
      <p className="lead muted measure">Lägg till vänner en gång, bjud sedan in dem till planer med ett klick.</p>
      {error && <p className="plan-notice" role="alert">{error}</p>}
      {message && <p className="plan-notice" role="status">{message}</p>}

      {incoming && (
        <div className="friend-invite">
          <p><strong>{incoming.name}</strong> vill bli vän med dig.</p>
          <Button disabled={busy || needsName} onClick={() => run(async () => {
            const result = await addFriend(incoming.code);
            setIncoming(null);
            window.history.replaceState(null, '', '/vanner');
            return RESULT_TEXT[result];
          })}>Lägg till {incoming.name}</Button>
        </div>
      )}

      {needsName && (
        <form className="plan-form" onSubmit={(event: FormEvent) => { event.preventDefault(); if (nameInput.trim()) void run(async () => { await setDisplayName(nameInput.trim()); }); }}>
          <Field label="Vad ska vännerna kalla dig?" value={nameInput} onChange={event => setNameInput(event.target.value)} maxLength={40} autoComplete="given-name" />
          <Button type="submit" disabled={busy || !nameInput.trim()}>Spara namn</Button>
        </form>
      )}

      {code && (
        <div className="invite-box">
          <div className="invite-box__row">
            <Field label="Din vänlänk" readOnly value={link} onFocus={event => event.currentTarget.select()} hint={`Eller kod: ${code}`} />
            <Button variant="secondary" onClick={async () => {
              try { await navigator.clipboard.writeText(link); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
            }}>
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copied ? 'Kopierad' : 'Kopiera'}
            </Button>
          </div>
        </div>
      )}

      <form className="plan-form" onSubmit={(event: FormEvent) => {
        event.preventDefault();
        const wanted = parseFriendCode(entered);
        if (wanted) void run(async () => { const result = await addFriend(wanted); setEntered(''); return RESULT_TEXT[result]; });
      }}>
        <Field label="Lägg till med kod eller länk" value={entered} onChange={event => setEntered(event.target.value)} autoComplete="off" />
        <Button type="submit" variant="secondary" disabled={busy || needsName || !entered.trim()}>Lägg till</Button>
      </form>

      {friends === null ? (
        <Skeleton className="skeleton--row" />
      ) : (
        <>
          {requests.length > 0 && (
            <FriendGroup title="Förfrågningar">
              {requests.map(friend => (
                <FriendRow key={friend.userId} friend={friend}>
                  <Button disabled={busy} onClick={() => run(() => respondFriend(friend.userId, true))}>Acceptera</Button>
                  <Button variant="ghost" disabled={busy} onClick={() => run(() => respondFriend(friend.userId, false))}>Avböj</Button>
                </FriendRow>
              ))}
            </FriendGroup>
          )}
          <FriendGroup title={`Dina vänner (${accepted.length})`}>
            {accepted.length === 0
              ? <li className="muted">Inga vänner än. Dela din länk, eller klistra in en väns.</li>
              : accepted.map(friend => (
                <FriendRow key={friend.userId} friend={friend}>
                  <Button variant="ghost" disabled={busy} onClick={() => run(() => removeFriend(friend.userId))}>Ta bort</Button>
                </FriendRow>
              ))}
          </FriendGroup>
          {sent.length > 0 && (
            <FriendGroup title="Väntar på svar">
              {sent.map(friend => (
                <FriendRow key={friend.userId} friend={friend}>
                  <Button variant="ghost" disabled={busy} onClick={() => run(() => removeFriend(friend.userId))}>Ångra</Button>
                </FriendRow>
              ))}
            </FriendGroup>
          )}
        </>
      )}
      <p className="small muted">Planerna hittar du under <Link href="/plan">Planer</Link>. <Link href="/konto">Kontoinställningar</Link></p>
    </section>
  );
}

function FriendGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="friend-group">
      <h2 className="lead">{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}

function FriendRow({ friend, children }: { friend: Friend; children: React.ReactNode }) {
  return (
    <li className="friend-row">
      <span className="friend-row__name">{friend.displayName}</span>
      <span className="friend-row__actions">{children}</span>
    </li>
  );
}
