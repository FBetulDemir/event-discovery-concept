'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { hasNews, loadFriends, loadInvites, loadUnread, type Invite, type PlanUnread } from '@/lib/social/api';
import { useAuth } from '@/lib/useAuth';

type Value = {
  unread: Map<string, PlanUnread>;
  invites: Invite[];
  friendRequests: number;
  /** What the nav badge shows: plans with news + open invites + friend requests. */
  total: number;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<Value | null>(null);
const POLL_MS = 60_000;

/**
 * What is new for me: activity in my plans since I last opened them, plan invitations from friends
 * and friend requests. Polled gently (on focus and once a minute) and refreshed after I open a plan.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const signedIn = auth.status === 'guest' || auth.status === 'account';
  const isAccount = auth.status === 'account';
  const [unread, setUnread] = useState<Map<string, PlanUnread>>(new Map());
  const [invites, setInvites] = useState<Invite[]>([]);
  const [friendRequests, setFriendRequests] = useState(0);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !signedIn) {
      setUnread(new Map()); setInvites([]); setFriendRequests(0);
      return;
    }
    try {
      const rows = await loadUnread();
      setUnread(new Map(rows.map(row => [row.planId, row])));
      if (isAccount) {
        const [inv, friends] = await Promise.all([loadInvites(), loadFriends()]);
        setInvites(inv);
        setFriendRequests(friends.filter(friend => friend.relation === 'incoming').length);
      }
    } catch {
      // Notifications are a convenience: stay quiet and keep the last known state.
    }
  }, [signedIn, isAccount]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refresh]);

  const value = useMemo<Value>(() => ({
    unread, invites, friendRequests, refresh,
    total: [...unread.values()].filter(hasNews).length + invites.length + friendRequests,
  }), [unread, invites, friendRequests, refresh]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): Value {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error('useNotifications requires NotificationsProvider');
  return value;
}
