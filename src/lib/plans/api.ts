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
  /** The day the plan is for (YYYY-MM-DD), or null if the organizer has not set one. */
  planDate: string | null;
};
export type PlanMember = { userId: string; displayName: string; role: 'organizer' | 'member' };
export type PlanEvent = { id: string; addedBy: string; snapshot: EventSnapshot };
export type PlanVote = { userId: string; planEventId: string };
export type PlanState = { plan: Plan; members: PlanMember[]; events: PlanEvent[]; votes: PlanVote[] };
export type PlanPreview = {
  planId: string; title: string; status: 'open' | 'decided'; organizerName: string; planDate: string | null;
  memberNames: string[]; events: EventSnapshot[];
};

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
  plan_date: string | null;
}): Plan => ({
  planDate: row.plan_date,
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
    planDate: row.plan_date,
    memberNames: row.member_names,
    events: (row.events as unknown as EventSnapshot[]) ?? [],
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

export type MyPlan = Plan & {
  memberCount: number;
  eventCount: number;
  /** First shortlisted event, for a thumbnail. */
  cover: EventSnapshot | null;
  /** Whether you have voted yet (only meaningful while the plan is open). */
  iHaveVoted: boolean;
  votes: number;
};

export async function listMyPlans(): Promise<MyPlan[]> {
  const supabase = getSupabase();
  const me = (await supabase.auth.getSession()).data.session?.user.id;
  const { data, error } = await supabase
    .from('plans')
    .select('*, plan_members(count), plan_events!plan_events_plan_id_fkey(id, snapshot, created_at)')
    .order('created_at', { ascending: false });
  if (error) fail(error);
  const plans = data ?? [];
  const votes = plans.length
    ? await supabase.from('votes').select('plan_id, user_id').in('plan_id', plans.map(plan => plan.id))
    : { data: [], error: null };
  if (votes.error) fail(votes.error);

  return plans.map(row => {
    // The embed is typed as one-or-many because of the composite FK; at runtime it is an array.
    const events = [...((row.plan_events as unknown as { id: string; snapshot: Json; created_at: string }[] | null) ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const planVotes = (votes.data ?? []).filter(vote => vote.plan_id === row.id);
    return {
      ...asPlan(row),
      memberCount: row.plan_members[0]?.count ?? 0,
      eventCount: events.length,
      cover: (events[0]?.snapshot as unknown as EventSnapshot) ?? null,
      iHaveVoted: planVotes.some(vote => vote.user_id === me),
      votes: planVotes.length,
    };
  });
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

/** Organizer only, while the plan is open. */
export async function updatePlan(planId: string, title: string, planDate: string | null): Promise<Plan> {
  const { data, error } = await getSupabase().rpc('update_plan', { p_plan_id: planId, p_title: title, p_plan_date: planDate });
  if (error) fail(error);
  return asPlan(data);
}

// ------------------------------------------------------------------ comments and reactions

export type ReactionKind = 'like' | 'love' | 'laugh' | 'fire' | 'wow';
export const REACTIONS: { kind: ReactionKind; label: string }[] = [
  { kind: 'like', label: 'Gilla' },
  { kind: 'love', label: 'Älskar' },
  { kind: 'laugh', label: 'Skratt' },
  { kind: 'fire', label: 'Eld' },
  { kind: 'wow', label: 'Wow' },
];

export type CommentTarget = { type: 'plan' | 'event'; id: string };
export type CommentNode = {
  id: string; parentId: string | null; depth: number; authorId: string; authorName: string; body: string;
  deleted: boolean; createdAt: string;
  reactions: Partial<Record<ReactionKind, number>>;
  mine: ReactionKind[];
  replies: CommentNode[];
};

const COMMENT_ERRORS = ['account_required', 'rate_limited', 'forbidden', 'display_name_required', 'invalid_body', 'plan_not_found', 'parent_not_found'] as const;
export type CommentErrorCode = (typeof COMMENT_ERRORS)[number] | 'unknown';
export class CommentError extends Error {
  constructor(readonly code: CommentErrorCode) { super(code); this.name = 'CommentError'; }
}
function failComment(error: { message: string }): never {
  throw new CommentError(COMMENT_ERRORS.find(code => error.message.includes(code)) ?? 'unknown');
}

/** The whole thread as a tree (roots oldest first, replies oldest first), with reaction counts. */
export async function loadComments(target: CommentTarget, me: string | null): Promise<CommentNode[]> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from('comments').select('*, profiles!comments_author_id_fkey(display_name)')
    .eq('target_type', target.type).eq('target_id', target.id).order('created_at');
  if (error) failComment(error);
  const ids = (rows ?? []).map(row => row.id);
  const reactions = ids.length
    ? await supabase.from('comment_reactions').select('comment_id, user_id, emoji').in('comment_id', ids)
    : { data: [], error: null };
  if (reactions.error) failComment(reactions.error);

  const byId = new Map<string, CommentNode>();
  for (const row of rows ?? []) {
    byId.set(row.id, {
      id: row.id, parentId: row.parent_id, depth: row.depth, authorId: row.author_id,
      authorName: row.profiles?.display_name ?? '?', body: row.body, deleted: row.deleted_at !== null,
      createdAt: row.created_at, reactions: {}, mine: [], replies: [],
    });
  }
  for (const reaction of reactions.data ?? []) {
    const node = byId.get(reaction.comment_id);
    const kind = reaction.emoji as ReactionKind;
    if (!node) continue;
    node.reactions[kind] = (node.reactions[kind] ?? 0) + 1;
    if (reaction.user_id === me) node.mine.push(kind);
  }
  const roots: CommentNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    (parent ? parent.replies : roots).push(node);
  }
  return roots;
}

export async function addComment(target: CommentTarget, body: string, parentId: string | null, displayName?: string): Promise<void> {
  await ensureUser();
  const { error } = await getSupabase().rpc('add_comment', {
    p_target_type: target.type, p_target_id: target.id, p_parent_id: parentId, p_body: body, p_display_name: displayName,
  });
  if (error) failComment(error);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await getSupabase().rpc('delete_comment', { p_comment_id: commentId });
  if (error) failComment(error);
}

/** Adds the reaction, or removes it if you already gave it. */
export async function toggleReaction(commentId: string, userId: string, kind: ReactionKind, already: boolean): Promise<void> {
  const supabase = getSupabase();
  const { error } = already
    ? await supabase.from('comment_reactions').delete().eq('comment_id', commentId).eq('user_id', userId).eq('emoji', kind)
    : await supabase.from('comment_reactions').insert({ comment_id: commentId, user_id: userId, emoji: kind });
  if (error) failComment(error);
}

export async function reportComment(commentId: string, userId: string, reason?: string): Promise<void> {
  const { error } = await getSupabase().from('comment_reports').insert({ comment_id: commentId, reporter_id: userId, reason: reason ?? null });
  // 23505 = already reported: the outcome the person wanted.
  if (error && error.code !== '23505') failComment(error);
}

export function subscribeToComments(target: CommentTarget, onChange: () => void): () => void {
  const supabase = getSupabase();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const notify = () => { clearTimeout(timer); timer = setTimeout(onChange, 150); };
  const channel = supabase.channel(`comments:${target.type}:${target.id}`);
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `target_id=eq.${target.id}` }, notify);
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'comment_reactions' }, notify);
  channel.subscribe();
  return () => { clearTimeout(timer); void supabase.removeChannel(channel); };
}
