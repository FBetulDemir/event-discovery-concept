'use client';

import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { sendSignInLink, signInExisting, signOut } from '@/lib/supabase/auth';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackendNotice } from '@/components/plan/BackendNotice';

type Step = { kind: 'form' } | { kind: 'sent'; email: string } | { kind: 'taken'; email: string };

export function AccountPanel() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>({ kind: 'form' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) return <BackendNotice />;
  if (auth.status === 'loading') return <section className="page plan" aria-busy="true"><Skeleton className="skeleton--row" /></section>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const address = email.trim();
    if (!address) { setError('Skriv din e-postadress.'); return; }
    setBusy(true); setError(null);
    try {
      setStep(await sendSignInLink(address) === 'email_taken' ? { kind: 'taken', email: address } : { kind: 'sent', email: address });
    } catch {
      setError('Det gick inte att skicka länken. Kontrollera adressen och försök igen.');
    } finally {
      setBusy(false);
    }
  }

  async function loginExisting() {
    if (step.kind !== 'taken') return;
    setBusy(true); setError(null);
    try { await signInExisting(step.email); setStep({ kind: 'sent', email: step.email }); }
    catch { setError('Det gick inte att skicka länken. Försök igen.'); }
    finally { setBusy(false); }
  }

  if (auth.status === 'account') {
    return (
      <section className="page plan enter" aria-labelledby="account-title">
        <h1 id="account-title" className="head">Ditt konto</h1>
        <p className="lead muted">Du är inloggad som {auth.email}. Dina planer följer med på alla enheter.</p>
        <Button variant="secondary" onClick={() => signOut()}>Logga ut</Button>
      </section>
    );
  }

  const guest = auth.status === 'guest';
  return (
    <section className="page plan enter" aria-labelledby="account-title">
      <h1 id="account-title" className="head">{guest ? 'Spara dina planer' : 'Logga in'}</h1>
      <p className="lead muted measure">
        {guest
          ? 'Du är gäst på den här enheten. Lägg till en e-postadress så följer dina planer och röster med dig, och du kan kommentera event.'
          : 'Vi skickar en länk till din e-post. Inget lösenord. Första gången skapas ditt konto.'}
      </p>

      {step.kind === 'sent' ? (
        <div className="plan-form" role="status">
          <p className="lead">Kolla din e-post.</p>
          <p className="muted">Vi skickade en länk till {step.email}. Öppna den på den här enheten, så är du inloggad. Hittar du den inte, titta i skräpposten.</p>
          <Button variant="secondary" onClick={() => setStep({ kind: 'form' })}>Använd en annan adress</Button>
        </div>
      ) : step.kind === 'taken' ? (
        <div className="plan-form">
          <p className="lead">{step.email} har redan ett konto.</p>
          <p className="muted">Logga in där i stället. Planer du gjort som gäst här följer inte med, de stannar på den här enheten som gäst.</p>
          <Button disabled={busy} onClick={loginExisting}>Skicka inloggningslänk</Button>
          {error && <p className="plan-notice" role="alert">{error}</p>}
        </div>
      ) : (
        <form className="plan-form" onSubmit={submit}>
          <Field label="E-post" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="du@exempel.se" error={error} />
          <Button type="submit" disabled={busy}>{busy ? 'Skickar…' : 'Skicka länk'}</Button>
        </form>
      )}
    </section>
  );
}
