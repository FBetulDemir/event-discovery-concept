'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { AuthFailure, MIN_PASSWORD_LENGTH, signIn, signOut, signUp, type AuthProblem } from '@/lib/supabase/auth';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackendNotice } from '@/components/plan/BackendNotice';
import { PasswordRecovery } from './PasswordRecovery';
import { dismissRecovery, getRecoveryState, subscribeRecovery } from '@/lib/supabase/recovery-state';

type Mode = 'create' | 'login';

type Problem = AuthProblem | 'fill' | 'taken';

export function AccountPanel() {
  const auth = useAuth();
  const t = useTranslations('account');
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Problem | null>(null);
  const [noticeEmail, setNoticeEmail] = useState<string | null>(null);
  const [resetRequested, setResetRequested] = useState(false);
  const recovery = useSyncExternalStore(subscribeRecovery, getRecoveryState, () => 'idle' as const);

  if (!isSupabaseConfigured) return <BackendNotice />;
  if (resetRequested || recovery !== 'idle') {
    return <PasswordRecovery key={resetRequested ? 'request' : recovery} state={resetRequested ? 'request' : recovery} initialEmail={email}
      onBack={() => { setResetRequested(false); dismissRecovery(); }} />;
  }
  if (auth.status === 'loading') return <section className="page plan" aria-busy="true"><Skeleton className="skeleton--row" /></section>;

  if (auth.status === 'account') {
    return (
      <section className="page plan enter" aria-labelledby="account-title">
        <h1 id="account-title" className="head">{t('in.title')}</h1>
        <p className="lead muted">{t('in.lead', { email: auth.email })}</p>
        <div className="plan-organizer">
          <Link href="/vanner" className="btn btn--secondary">{t('in.friends')}</Link>
          <Button variant="ghost" onClick={() => signOut()}>{t('in.signOut')}</Button>
        </div>
      </section>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) { setError('fill'); return; }
    if (mode === 'create' && password.length < MIN_PASSWORD_LENGTH) { setError('weak_password'); return; }
    setBusy(true); setError(null); setNoticeEmail(null);
    try {
      if (mode === 'login') await signIn(email.trim(), password);
      else {
        const result = await signUp(email.trim(), password);
        if (result === 'email_taken') { setMode('login'); setError('taken'); }
        else if (result === 'needs_confirmation') setNoticeEmail(email.trim());
      }
    } catch (cause) {
      setError(cause instanceof AuthFailure ? cause.problem : 'unknown');
    } finally {
      setBusy(false);
    }
  }

  const guest = auth.status === 'guest';
  return (
    <section className="page plan enter" aria-labelledby="account-title">
      <h1 id="account-title" className="head">{mode === 'login' ? t('titleLogin') : guest ? t('titleGuest') : t('titleCreate')}</h1>
      <p className="lead muted measure">
        {guest && mode === 'create' ? t('leadGuest') : t('lead')}
      </p>

      <div className="design__row" role="group" aria-label={t('modeGroup')}>
        <Chip selected={mode === 'login'} disabled={busy} onClick={() => { setMode('login'); setError(null); setNoticeEmail(null); }}>{t('modeLogin')}</Chip>
        <Chip selected={mode === 'create'} disabled={busy} onClick={() => { setMode('create'); setError(null); setNoticeEmail(null); }}>{t('modeCreate')}</Chip>
      </div>

      {noticeEmail ? (
        <p className="lead" role="status">{t('notice', { email: noticeEmail })}</p>
      ) : (
        <form className="plan-form" onSubmit={submit} noValidate>
          <Field label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder={t('emailPlaceholder')} />
          <Field label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            hint={mode === 'create' ? t('passwordHint', { min: MIN_PASSWORD_LENGTH }) : undefined} error={error ? t(`problems.${error}`, { min: MIN_PASSWORD_LENGTH }) : null} />
          <Button type="submit" disabled={busy}>{busy ? t('busy') : mode === 'login' ? t('submitLogin') : t('submitCreate')}</Button>
          {mode === 'login' && <Button type="button" variant="ghost" disabled={busy} onClick={() => setResetRequested(true)}>{t('reset.forgot')}</Button>}
        </form>
      )}
    </section>
  );
}
