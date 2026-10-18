'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { AuthFailure, MIN_PASSWORD_LENGTH, signIn, signOut, signUp, type AuthProblem } from '@/lib/supabase/auth';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackendNotice } from '@/components/plan/BackendNotice';

type Mode = 'create' | 'login';

const PROBLEMS: Record<AuthProblem, string> = {
  bad_credentials: 'Fel e-post eller lösenord.',
  weak_password: `Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`,
  invalid_email: 'Kontrollera e-postadressen.',
  unknown: 'Något gick fel, försök igen.',
};

export function AccountPanel() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured) return <BackendNotice />;
  if (auth.status === 'loading') return <section className="page plan" aria-busy="true"><Skeleton className="skeleton--row" /></section>;

  if (auth.status === 'account') {
    return (
      <section className="page plan enter" aria-labelledby="account-title">
        <h1 id="account-title" className="head">Ditt konto</h1>
        <p className="lead muted">Du är inloggad som {auth.email}. Dina planer följer med på alla enheter.</p>
        <div className="plan-organizer">
          <Link href="/vanner" className="btn btn--secondary">Mina vänner</Link>
          <Button variant="ghost" onClick={() => signOut()}>Logga ut</Button>
        </div>
      </section>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) { setError('Fyll i e-post och lösenord.'); return; }
    if (mode === 'create' && password.length < MIN_PASSWORD_LENGTH) { setError(PROBLEMS.weak_password); return; }
    setBusy(true); setError(null); setNotice(null);
    try {
      if (mode === 'login') await signIn(email.trim(), password);
      else {
        const result = await signUp(email.trim(), password);
        if (result === 'email_taken') { setMode('login'); setError('Den e-postadressen har redan ett konto. Logga in i stället.'); }
        else if (result === 'needs_confirmation') setNotice(`Vi skickade en bekräftelselänk till ${email.trim()}. Öppna den, så är kontot klart.`);
      }
    } catch (cause) {
      setError(PROBLEMS[cause instanceof AuthFailure ? cause.problem : 'unknown']);
    } finally {
      setBusy(false);
    }
  }

  const guest = auth.status === 'guest';
  return (
    <section className="page plan enter" aria-labelledby="account-title">
      <h1 id="account-title" className="head">{guest ? 'Spara dina planer' : mode === 'login' ? 'Logga in' : 'Skapa konto'}</h1>
      <p className="lead muted measure">
        {guest
          ? 'Du är gäst på den här enheten. Skapa ett konto så följer dina planer och röster med dig, och du kan kommentera event och lägga till vänner.'
          : 'Med ett konto sparas dina planer på alla enheter, och du kan kommentera event och lägga till vänner.'}
      </p>

      {!guest && (
        <div className="design__row" role="group" aria-label="Konto">
          <Chip selected={mode === 'create'} onClick={() => { setMode('create'); setError(null); }}>Skapa konto</Chip>
          <Chip selected={mode === 'login'} onClick={() => { setMode('login'); setError(null); }}>Jag har redan ett</Chip>
        </div>
      )}

      {notice ? (
        <p className="lead" role="status">{notice}</p>
      ) : (
        <form className="plan-form" onSubmit={submit} noValidate>
          <Field label="E-post" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="du@exempel.se" />
          <Field label="Lösenord" type="password" value={password} onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            hint={mode === 'create' ? `Minst ${MIN_PASSWORD_LENGTH} tecken.` : undefined} error={error} />
          <Button type="submit" disabled={busy}>{busy ? 'Ett ögonblick…' : mode === 'login' && !guest ? 'Logga in' : 'Skapa konto'}</Button>
        </form>
      )}
    </section>
  );
}
