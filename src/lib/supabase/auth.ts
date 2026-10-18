import { getSupabase } from './client';

/**
 * Account actions. A guest (anonymous session) that adds an email keeps its user id, so its plans,
 * memberships and votes stay: Supabase turns the same user into a permanent one once the emailed
 * link is opened. Someone with no session at all just signs in.
 */
export type SignInResult = 'link_sent' | 'email_taken';

export async function sendSignInLink(email: string): Promise<SignInResult> {
  const supabase = getSupabase();
  const emailRedirectTo = `${window.location.origin}/konto`;
  const { data } = await supabase.auth.getSession();

  if (data.session?.user.is_anonymous) {
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo });
    if (!error) return 'link_sent';
    if (/already|registered|exists/i.test(error.message)) return 'email_taken';
    throw new Error(error.message);
  }
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo, shouldCreateUser: true } });
  if (error) throw new Error(error.message);
  return 'link_sent';
}

/** Signs in an existing account even though a guest session is open (the guest's data stays with the guest). */
export async function signInExisting(email: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/konto`, shouldCreateUser: false } });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}
