'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export type AuthState =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'guest'; userId: string }
  | { status: 'account'; userId: string; email: string };

/** Who is signed in, live. Never creates a session: browsing stays account-free. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(isSupabaseConfigured ? { status: 'loading' } : { status: 'none' });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    const apply = (user: { id: string; email?: string; is_anonymous?: boolean } | null | undefined) => {
      if (!user) setState({ status: 'none' });
      else if (user.is_anonymous) setState({ status: 'guest', userId: user.id });
      else setState({ status: 'account', userId: user.id, email: user.email ?? '' });
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}
