export type RecoveryState = 'idle' | 'pending' | 'ready' | 'invalid' | 'complete';

/** Only known callback fields affect the UI; never display the provider's URL error text. */
export function recoveryFromHash(hash: string): RecoveryState {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.has('error') || params.has('error_code')) return 'invalid';
  return params.get('type') === 'recovery' ? 'pending' : 'idle';
}

export function recoveryRedirect(origin: string, locale: string): string {
  return new URL(locale === 'en' ? '/en/konto' : '/konto', origin).toString();
}

export function canResumeRecovery(savedUserId: string | null, user: { id: string; is_anonymous?: boolean } | null): boolean {
  return !!user && !user.is_anonymous && savedUserId === user.id;
}

export function validateNewPassword(password: string, confirmation: string, minimum: number): 'weak_password' | 'mismatch' | null {
  if (password.length < minimum) return 'weak_password';
  return password === confirmation ? null : 'mismatch';
}
