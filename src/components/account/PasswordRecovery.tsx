'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AuthFailure, MIN_PASSWORD_LENGTH, requestPasswordReset, saveRecoveredPassword } from '@/lib/supabase/auth';
import { validateNewPassword, type RecoveryState } from '@/lib/password-recovery';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

type Props = {
  state: RecoveryState | 'request'; initialEmail: string; onBack: () => void;
  requestReset?: typeof requestPasswordReset;
  updatePassword?: typeof saveRecoveredPassword;
  embedded?: boolean;
};

export function PasswordRecovery({ state, initialEmail, onBack, requestReset = requestPasswordReset, updatePassword = saveRecoveredPassword, embedded = false }: Props) {
  const t = useTranslations('account');
  const locale = useLocale();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const updating = state === 'ready';
  const requesting = state === 'request' || state === 'invalid';

  useEffect(() => { if (!embedded) heading.current?.focus(); }, [state, sent, embedded]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (updating) {
      const problem = validateNewPassword(password, confirmation, MIN_PASSWORD_LENGTH);
      if (problem) {
        setError(problem === 'mismatch' ? t('reset.mismatch') : t('problems.weak_password', { min: MIN_PASSWORD_LENGTH }));
        return;
      }
    } else if (!email.trim()) {
      setError(t('reset.emailRequired'));
      return;
    }
    setBusy(true);
    try {
      if (updating) {
        await updatePassword(password);
        setPassword(''); setConfirmation('');
      } else {
        await requestReset(email.trim(), window.location.origin, locale);
        setSent(true);
      }
    } catch (cause) {
      setError(cause instanceof AuthFailure
        ? t(`problems.${cause.problem}`, { min: MIN_PASSWORD_LENGTH })
        : t('problems.unknown'));
    } finally { setBusy(false); }
  }

  const title = state === 'complete' ? t('reset.completeTitle') : updating ? t('reset.newTitle') : t('reset.title');
  const Title = embedded ? 'h3' : 'h1';
  return (
    <section className={embedded ? 'plan-form' : 'page plan enter'} aria-labelledby="reset-title">
      <Title ref={heading} id="reset-title" tabIndex={-1} className={embedded ? 'lead' : 'head'}>{title}</Title>
      {state === 'pending' && <p role="status">{t('reset.checking')}</p>}
      {state === 'complete' && <p role="status">{t('reset.complete')}</p>}
      {sent ? <p className="lead" role="status">{t('reset.sent')}</p> : (requesting || updating) && (
        <>
          {state === 'invalid' && <p className="plan-notice" role="alert">{t('reset.invalid')}</p>}
          <p className="lead muted measure">{updating ? t('reset.newLead') : t('reset.lead')}</p>
          <form className="plan-form" onSubmit={submit}>
            {updating ? (
              <>
                <Field label={t('reset.newPassword')} type="password" autoComplete="new-password" required
                  value={password} onChange={event => setPassword(event.target.value)} hint={t('passwordHint', { min: MIN_PASSWORD_LENGTH })} />
                <Field label={t('reset.confirmPassword')} type="password" autoComplete="new-password" required
                  value={confirmation} onChange={event => setConfirmation(event.target.value)} />
              </>
            ) : <Field label={t('email')} type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />}
            {error && <p className="plan-notice" role="alert">{error}</p>}
            <Button type="submit" disabled={busy}>{busy ? t('busy') : updating ? t('reset.save') : t('reset.send')}</Button>
          </form>
        </>
      )}
      {state !== 'pending' && <Button variant="ghost" disabled={busy} onClick={onBack}>{t('reset.back')}</Button>}
    </section>
  );
}
