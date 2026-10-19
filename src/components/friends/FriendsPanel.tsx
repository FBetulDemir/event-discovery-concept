'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, getPathname } from '@/i18n/navigation';
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

const KNOWN_ERRORS = ['friend_not_found', 'cannot_add_self', 'display_name_required'] as const;
type FriendError = (typeof KNOWN_ERRORS)[number] | 'loadFailed' | 'generic';

export function FriendsPanel() {
  const auth = useAuth();
  const t = useTranslations('friends');
  const all = useTranslations();
  const locale = useLocale();
  const { refresh } = useNotifications();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [entered, setEntered] = useState('');
  const [message, setMessage] = useState<AddFriendResult | null>(null);
  const [error, setError] = useState<FriendError | null>(null);
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
      setError('loadFailed');
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

  async function run(action: () => Promise<AddFriendResult | void>) {
    setBusy(true); setError(null); setMessage(null);
    try {
      const text = await action();
      if (text) setMessage(text);
      await reload();
    } catch (cause) {
      setError(cause instanceof SocialError ? (KNOWN_ERRORS.find(code => code === cause.code) ?? 'generic') : 'generic');
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) return <BackendNotice />;
  if (auth.status === 'loading') return <section className="page plan" aria-busy="true"><Skeleton className="skeleton--row" /></section>;

  if (!isAccount) {
    return (
      <section className="page plan enter" aria-labelledby="friends-title">
        <h1 id="friends-title" className="head">{t('title')}</h1>
        <p className="lead muted measure">{t('needAccount.lead')}</p>
        <ButtonLink href="/konto">{t('needAccount.cta')}</ButtonLink>
      </section>
    );
  }

  const link = code && typeof window !== 'undefined' ? `${window.location.origin}${getPathname({ href: '/vanner', locale })}?kod=${code}` : '';
  const requests = friends?.filter(friend => friend.relation === 'incoming') ?? [];
  const sent = friends?.filter(friend => friend.relation === 'outgoing') ?? [];
  const accepted = friends?.filter(friend => friend.relation === 'friend') ?? [];

  return (
    <section className="page plan enter" aria-labelledby="friends-title">
      <h1 id="friends-title" className="head" data-reveal>{t('title')}</h1>
      <p className="lead muted measure">{t('lead')}</p>
      {error && <p className="plan-notice" role="alert">{error === 'generic' ? all('common.generic') : t(`errors.${error}`)}</p>}
      {message && <p className="plan-notice" role="status">{t(`results.${message}`)}</p>}

      {incoming && (
        <div className="friend-invite">
          <p>{t.rich('incoming.wants', { name: incoming.name, b: chunks => <strong>{chunks}</strong> })}</p>
          <Button disabled={busy || needsName} onClick={() => run(async () => {
            const result = await addFriend(incoming.code);
            setIncoming(null);
            window.history.replaceState(null, '', window.location.pathname);
            return result;
          })}>{t('incoming.add', { name: incoming.name })}</Button>
        </div>
      )}

      {needsName && (
        <form className="plan-form" onSubmit={(event: FormEvent) => { event.preventDefault(); if (nameInput.trim()) void run(async () => { await setDisplayName(nameInput.trim()); }); }}>
          <Field label={t('name.label')} value={nameInput} onChange={event => setNameInput(event.target.value)} maxLength={40} autoComplete="given-name" />
          <Button type="submit" disabled={busy || !nameInput.trim()}>{t('name.save')}</Button>
        </form>
      )}

      {code && (
        <div className="invite-box">
          <div className="invite-box__row">
            <Field label={t('link.label')} readOnly value={link} onFocus={event => event.currentTarget.select()} hint={t('link.hint', { code })} />
            <Button variant="secondary" onClick={async () => {
              try { await navigator.clipboard.writeText(link); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
            }}>
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copied ? t('link.copied') : t('link.copy')}
            </Button>
          </div>
        </div>
      )}

      <form className="plan-form" onSubmit={(event: FormEvent) => {
        event.preventDefault();
        const wanted = parseFriendCode(entered);
        if (wanted) void run(async () => { const result = await addFriend(wanted); setEntered(''); return result; });
      }}>
        <Field label={t('enter.label')} value={entered} onChange={event => setEntered(event.target.value)} autoComplete="off" />
        <Button type="submit" variant="secondary" disabled={busy || needsName || !entered.trim()}>{t('enter.add')}</Button>
      </form>

      {friends === null ? (
        <Skeleton className="skeleton--row" />
      ) : (
        <>
          {requests.length > 0 && (
            <FriendGroup title={t('groups.requests')}>
              {requests.map(friend => (
                <FriendRow key={friend.userId} friend={friend}>
                  <Button disabled={busy} onClick={() => run(() => respondFriend(friend.userId, true))}>{t('actions.accept')}</Button>
                  <Button variant="ghost" disabled={busy} onClick={() => run(() => respondFriend(friend.userId, false))}>{t('actions.decline')}</Button>
                </FriendRow>
              ))}
            </FriendGroup>
          )}
          <FriendGroup title={t('groups.yours', { count: accepted.length })}>
            {accepted.length === 0
              ? <li className="muted">{t('groups.empty')}</li>
              : accepted.map(friend => (
                <FriendRow key={friend.userId} friend={friend}>
                  <Button variant="ghost" disabled={busy} onClick={() => run(() => removeFriend(friend.userId))}>{t('actions.remove')}</Button>
                </FriendRow>
              ))}
          </FriendGroup>
          {sent.length > 0 && (
            <FriendGroup title={t('groups.waiting')}>
              {sent.map(friend => (
                <FriendRow key={friend.userId} friend={friend}>
                  <Button variant="ghost" disabled={busy} onClick={() => run(() => removeFriend(friend.userId))}>{t('actions.undo')}</Button>
                </FriendRow>
              ))}
            </FriendGroup>
          )}
        </>
      )}
      <p className="small muted">{t.rich('footer', { plans: chunks => <Link href="/plan">{chunks}</Link>, account: chunks => <Link href="/konto">{chunks}</Link> })}</p>
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
