import { getSupabase } from './client';

/**
 * Account actions: email + password. A guest that signs up keeps its user id (Supabase upgrades the
 * same anonymous user), so its plans, memberships, votes and comments stay.
 *
 * If the project has "Confirm email" switched on, an email is sent and the account is only usable
 * once it is opened; with it off (the simple setup, docs/BACKEND.md) no email is involved at all.
 */
export type SignUpResult = 'signed_in' | 'needs_confirmation' | 'email_taken';
export type AuthProblem = 'bad_credentials' | 'weak_password' | 'invalid_email' | 'unknown';

export const MIN_PASSWORD_LENGTH = 8;

export class AuthFailure extends Error {
  constructor(readonly problem: AuthProblem) { super(problem); this.name = 'AuthFailure'; }
}

function classify(error: { message: string; code?: string }): AuthProblem {
  const text = `${error.code ?? ''} ${error.message}`.toLowerCase();
  if (text.includes('invalid login') || text.includes('invalid_credentials') || text.includes('invalid credentials')) return 'bad_credentials';
  if (text.includes('weak_password') || text.includes('password')) return 'weak_password';
  if (text.includes('email_address_invalid') || text.includes('invalid') && text.includes('email')) return 'invalid_email';
  return 'unknown';
}

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  const supabase = getSupabase();
  const { data: current } = await supabase.auth.getSession();

  if (current.session?.user.is_anonymous) {
    const { data, error } = await supabase.auth.updateUser({ email, password });
    if (error) {
      if (/already|registered|exists/i.test(`${error.code ?? ''} ${error.message}`)) return 'email_taken';
      throw new AuthFailure(classify(error));
    }
    // With email confirmation on, the new address stays pending until the link is opened.
    return data.user.new_email ? 'needs_confirmation' : 'signed_in';
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (/already|registered|exists/i.test(`${error.code ?? ''} ${error.message}`)) return 'email_taken';
    throw new AuthFailure(classify(error));
  }
  // Supabase hides "already registered" behind an empty identities list when confirmation is on.
  if (data.user && data.user.identities?.length === 0) return 'email_taken';
  return data.session ? 'signed_in' : 'needs_confirmation';
}

/** Signs in an existing account. A guest session on this device stays behind as its own user. */
export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new AuthFailure(classify(error));
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}
