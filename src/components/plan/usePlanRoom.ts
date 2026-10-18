'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, ensureUser } from '@/lib/supabase/client';
import {
  addEventToPlan, closePlan, getPlanPreview, joinPlan, loadPlan, PlanError, removePlanEvent, setVote, subscribeToPlan, updatePlan,
  type PlanPreview, type PlanState,
} from '@/lib/plans/api';
import type { Event } from '@/types/event';
import { nextVote } from '@/lib/voting';
import { rememberName } from '@/lib/plans/displayName';

export type Room =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'error'; message: string }
  | { status: 'preview'; preview: PlanPreview | null }
  | { status: 'ready'; state: PlanState; userId: string };

/** One plan, live. `code` is the invite code from the URL. */
export function usePlanRoom(code: string) {
  const [room, setRoom] = useState<Room>(isSupabaseConfigured ? { status: 'loading' } : { status: 'unconfigured' });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<PlanError | null>(null);
  const userId = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const user = await ensureUser();
      userId.current = user.id;
      const state = await loadPlan(code);
      if (state) setRoom({ status: 'ready', state, userId: user.id });
      else setRoom({ status: 'preview', preview: await getPlanPreview(code) });
    } catch (error) {
      setRoom({ status: 'error', message: error instanceof Error ? error.message : 'Något gick fel' });
    }
  }, [code]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void refresh();
  }, [refresh]);

  const planId = room.status === 'ready' ? room.state.plan.id : null;
  useEffect(() => (planId ? subscribeToPlan(planId, () => void refresh()) : undefined), [planId, refresh]);

  /** Runs a write, then reloads so the screen always mirrors what the database accepted. */
  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof PlanError ? error : new PlanError('unknown'));
    } finally {
      await refresh();
      setBusy(false);
    }
  }

  return {
    room,
    busy,
    actionError,
    /** Joins with a name and, if one was picked on the invite screen, casts that vote straight away. */
    join: (displayName: string, favouriteEventId?: string | null) => act(async () => {
      rememberName(displayName);
      await joinPlan(code, displayName);
      if (favouriteEventId) {
        const state = await loadPlan(code);
        const entry = state?.events.find(event => event.snapshot.id === favouriteEventId);
        const user = await ensureUser();
        if (state && entry) await setVote(state.plan.id, user.id, entry.id);
      }
    }),
    addEvent: (event: Event) => {
      if (room.status !== 'ready') return;
      return act(() => addEventToPlan(room.state.plan.id, event, room.userId));
    },
    savePlan: (title: string, planDate: string | null) => {
      if (room.status !== 'ready') return;
      return act(() => updatePlan(room.state.plan.id, title, planDate));
    },
    vote: (planEventId: string) => {
      if (room.status !== 'ready') return;
      const { state, userId: me } = room;
      const current = state.votes.find(vote => vote.userId === me)?.planEventId ?? null;
      const next = nextVote(current, planEventId);
      // Optimistic: show the tap immediately; the reload that follows corrects it if refused.
      setRoom({
        ...room,
        state: {
          ...state,
          votes: [...state.votes.filter(vote => vote.userId !== me), ...(next ? [{ userId: me, planEventId: next }] : [])],
        },
      });
      return act(() => setVote(state.plan.id, me, next));
    },
    remove: (planEventId: string) => act(() => removePlanEvent(planEventId)),
    close: (planEventId?: string) => room.status === 'ready' ? act(() => closePlan(room.state.plan.id, planEventId)) : undefined,
  };
}
