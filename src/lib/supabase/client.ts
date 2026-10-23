import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { initializeRecovery, observeRecovery } from './recovery-state';

let client: SupabaseClient<Database> | null = null;

// NEXT_PUBLIC_* must be referenced literally so Next.js can inline them into the browser bundle.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

/** Browser client. The publishable key is public by design; RLS decides what each user can do. */
export function getSupabase(): SupabaseClient<Database> {
  if (!url || !publishableKey) {
    throw new Error('Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).');
  }
  if (!client) {
    initializeRecovery();
    client = createClient<Database>(url, publishableKey);
    client.auth.onAuthStateChange((event, session) => observeRecovery(event, session?.user ?? null));
  }
  return client;
}

/**
 * Returns the signed-in user, creating a guest (anonymous) session first if there is none.
 * Call it at the moment a person acts (joins, votes, creates), not on page load, so merely
 * browsing never creates accounts.
 */
export async function ensureUser(): Promise<{ id: string; isGuest: boolean }> {
  const supabase = getSupabase();
  const { data: current } = await supabase.auth.getSession();
  if (current.session) return { id: current.session.user.id, isGuest: Boolean(current.session.user.is_anonymous) };
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) throw new Error(error?.message ?? 'Could not start a guest session');
  return { id: data.user.id, isGuest: true };
}

/** The current user if a session already exists. Never creates one (unlike `ensureUser`). */
export async function getExistingUser(): Promise<{ id: string; isGuest: boolean } | null> {
  const { data } = await getSupabase().auth.getSession();
  const user = data.session?.user;
  return user ? { id: user.id, isGuest: Boolean(user.is_anonymous) } : null;
}
