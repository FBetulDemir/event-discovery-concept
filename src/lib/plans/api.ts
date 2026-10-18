import type { Event } from '@/types/event';
import { ensureUser, getSupabase } from '@/lib/supabase/client';
import type { Json } from '@/lib/supabase/database.types';
import { toSnapshot, type EventSnapshot } from './snapshot';

/** Client-side data access for plans. All authorization is enforced by RLS and the RPCs. */

export type Plan = {
  id: string;
  inviteCode: string;
  title: string;
  status: 'open' | 'decided';
  organizerId: string;
  decidedPlanEventId: string | null;
};
export type PlanMember = { userId: string; displayName: string; role: 'organizer' | 'member' };
export type PlanEvent = { id: string; addedBy: string; snapshot: EventSnapshot };
export type PlanVote = { userId: string; planEventId: string };
export type PlanState = { plan: Plan; members: PlanMember[]; events: PlanEvent[]; votes: PlanVote[] };
export type PlanPreview = { planId: string; title: string; status: 'open' | 'decided'; organizerName: string; memberCount: number };

/** Server-side rule violations the UI can explain. */
export type PlanErrorCode = 'tie' | 'forbidden' | 'plan_not_found' | 'already_decided' | 'no_events' | 'closed' | 'unknown';
export class PlanError extends Error {
  constructor(readonly code: PlanErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'PlanError';
  }
}

const KNOWN: PlanErrorCode[] = ['tie', 'forbidden', 'plan_not_found', 'already_decided', 'no_events'];

function fail(error: { message: string; code?: string }): never {
  const known = KNOWN.find(code => error.message.includes(code));
  if (known) throw new PlanError(known);
  // 42501 = RLS refused the write: in practice the plan was closed (or you are not a member).
  if (error.code === '42501') throw new PlanError('closed');
  throw new PlanError('unknown', error.message);
}

const asPlan = (row: {
  id: string; invite_code: string; title: string; status: string; organizer_id: string; decided_plan_event_id: string | null;
}): Plan => ({
  id: row.id,
  inviteCode: row.invite_code,
  title: row.title,
  status: row.status === 'decided' ? 'decided' : 'open',
  organizerId: row.organizer_id,
  decidedPlanEventId: row.decided_plan_event_id,
});

export async function createPlan(title: string, displayName: string, firstEvent?: Event): Promise<Plan> {
  const user = await ensureUser();
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('create_plan', { p_title: title, p_display_name: displayName });
  if (error) fail(error);
  const plan = asPlan(data);
  if (firstEvent) await addEventToPlan(plan.id, firstEvent, user.id);
  return plan;
}

export async function getPlanPreview(inviteCode: string): Promise<PlanPreview | null> {
  await ensureUser();
  const { data, error } = await getSupabase().rpc('get_plan_preview', { p_invite_code: inviteCode });
  if (error) fail(error);
  const row = data[0];
  if (!row) return null;
  return {
    planId: row.plan_id,
    title: row.title,
    status: row.status === 'decided' ? 'decided' : 'open',
    organizerName: row.organizer_name,
    memberCount: Number(row.member_count),
  };
}

export async function joinPlan(inviteCode: string, displayName: string): Promise<string> {
  await ensureUser();
  const { data, error } = await getSupabase().rpc('join_plan', { p_invite_code: inviteCode, p_display_name: displayName });
  if (error) fail(error);
  return data;
}

/** The plan with everything in it, or `null` if you are not a member (RLS hides it). */
export async function loadPlan(inviteCode: string): Promise<PlanState | null> {
  const supabase = getSupabase();
  const { data: row, error } = await supabase.from('plans').select('*').eq('invite_code', inviteCode).maybeSingle();
  if (error) fail(error);
  if (!row) return null;

  const [members, events, votes] = await Promise.all([
    supabase.from('plan_members').select('user_id, role, joined_at, profiles(display_name)').eq('plan_id', row.id).order('joined_at'),
    supabase.from('plan_events').select('id, added_by, snapshot').eq('plan_id', row.id).order('created_at'),
    supabase.from('votes').select('user_id, plan_event_id').eq('plan_id', row.id),
  ]);
  for (const result of [members, events, votes]) if (result.error) fail(result.error);

  return {
    plan: asPlan(row),
    members: (members.data ?? []).map(member => ({
      userId: member.user_id,
      displayName: member.profiles?.display_name ?? '?',
      role: member.role === 'organizer' ? 'organizer' : 'member',
    })),
    events: (events.data ?? []).map(event => ({ id: event.id, addedBy: event.added_by, snapshot: event.snapshot as unknown as EventSnapshot })),
    votes: (votes.data ?? []).map(vote => ({ userId: vote.user_id, planEventId: vote.plan_event_id })),
  };
}

export type MyPlan = Plan & { memberCount: number };

export async function listMyPlans(): Promise<MyPlan[]> {
  const { data, error } = await getSupabase()
    .from('plans')
    .select('*, plan_members(count)')
    .order('created_at', { ascending: false });
  if (error) fail(error);
  return (data ?? []).map(row => ({ ...asPlan(row), memberCount: row.plan_members[0]?.count ?? 0 }));
}

export async function addEventToPlan(planId: string, event: Event, userId: string): Promise<void> {
  const { error } = await getSupabase().from('plan_events').insert({
    plan_id: planId,
    source: event.source,
    external_id: event.externalId,
    snapshot: toSnapshot(event) as unknown as Json,
    added_by: userId,
  });
  // 23505 = already on the shortlist, which is the outcome the person wanted anyway.
  if (error && error.code !== '23505') fail(error);
}

export async function removePlanEvent(planEventId: string): Promise<void> {
  const { error } = await getSupabase().from('plan_events').delete().eq('id', planEventId);
  if (error) fail(error);
}

/** Sets your single vote for the plan, or withdraws it with `null`. */
export async function setVote(planId: string, userId: string, planEventId: string | null): Promise<void> {
  const supabase = getSupabase();
  if (planEventId === null) {
    const { error } = await supabase.from('votes').delete().eq('plan_id', planId).eq('user_id', userId);
    if (error) fail(error);
    return;
  }
  const { error } = await supabase.from('votes').upsert(
    { plan_id: planId, user_id: userId, plan_event_id: planEventId },
    { onConflict: 'plan_id,user_id' },
  );
  if (error) fail(error);
}

export async function closePlan(planId: string, planEventId?: string): Promise<Plan> {
  const { data, error } = await getSupabase().rpc('close_plan', { p_plan_id: planId, p_plan_event_id: planEventId });
  if (error) fail(error);
  return asPlan(data);
}

/**
 * Calls `onChange` whenever anything in the plan changes for anyone. Changes are not applied
 * incrementally: callers just reload, which keeps the client trivially consistent with RLS.
 * Returns an unsubscribe function.
 */
export function subscribeToPlan(planId: string, onChange: () => void): () => void {
  const supabase = getSupabase();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const notify = () => {
    clearTimeout(timer);
    timer = setTimeout(onChange, 150);
  };
  const channel = supabase.channel(`plan:${planId}`);
  for (const table of ['votes', 'plan_events', 'plan_members'] as const) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `plan_id=eq.${planId}` }, notify);
  }
  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'plans', filter: `id=eq.${planId}` }, notify);
  channel.subscribe();
  return () => {
    clearTimeout(timer);
    void supabase.removeChannel(channel);
  };
}
