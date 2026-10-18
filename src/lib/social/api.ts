import { getSupabase } from '@/lib/supabase/client';
import type { PlanUnread } from './news.ts';

export { describeNews, hasNews, parseFriendCode, type PlanUnread } from './news.ts';

/** Notifications, friends and plan invites. Friends and invites need a real account. */

export type SocialErrorCode =
  | 'account_required' | 'display_name_required' | 'friend_not_found' | 'cannot_add_self' | 'not_friends'
  | 'forbidden' | 'invite_not_found' | 'unknown';
export class SocialError extends Error {
  constructor(readonly code: SocialErrorCode) { super(code); this.name = 'SocialError'; }
}
const CODES: SocialErrorCode[] = ['account_required', 'display_name_required', 'friend_not_found', 'cannot_add_self', 'not_friends', 'forbidden', 'invite_not_found'];
function fail(error: { message: string }): never {
  throw new SocialError(CODES.find(code => error.message.includes(code)) ?? 'unknown');
}

// ---------------------------------------------------------------- unread activity

export async function loadUnread(): Promise<PlanUnread[]> {
  const { data, error } = await getSupabase().rpc('my_unread');
  if (error) fail(error);
  return (data ?? []).map(row => ({
    planId: row.plan_id, votes: row.new_votes, comments: row.new_comments, events: row.new_events, members: row.new_members, decided: row.decided,
  }));
}

export async function markPlanSeen(planId: string): Promise<void> {
  const { error } = await getSupabase().rpc('mark_plan_seen', { p_plan_id: planId });
  if (error) fail(error);
}

// ---------------------------------------------------------------- friends

export type Friend = { userId: string; displayName: string; relation: 'friend' | 'incoming' | 'outgoing' };
export type AddFriendResult = 'requested' | 'accepted' | 'already_friends' | 'already_requested';

export async function setDisplayName(name: string): Promise<void> {
  const { error } = await getSupabase().rpc('set_display_name', { p_name: name });
  if (error) fail(error);
}

export async function myFriendCode(): Promise<string> {
  const { data, error } = await getSupabase().rpc('my_friend_code');
  if (error) fail(error);
  return data;
}

export async function friendPreview(code: string): Promise<{ userId: string; displayName: string } | null> {
  const { data, error } = await getSupabase().rpc('friend_preview', { p_code: code });
  if (error) fail(error);
  const row = data?.[0];
  return row ? { userId: row.user_id, displayName: row.display_name } : null;
}

export async function addFriend(code: string): Promise<AddFriendResult> {
  const { data, error } = await getSupabase().rpc('add_friend', { p_code: code });
  if (error) fail(error);
  return data as AddFriendResult;
}

export async function respondFriend(requester: string, accept: boolean): Promise<void> {
  const { error } = await getSupabase().rpc('respond_friend', { p_requester: requester, p_accept: accept });
  if (error) fail(error);
}

export async function removeFriend(other: string): Promise<void> {
  const { error } = await getSupabase().rpc('remove_friend', { p_other: other });
  if (error) fail(error);
}

export async function loadFriends(): Promise<Friend[]> {
  const { data, error } = await getSupabase().rpc('my_friends');
  if (error) fail(error);
  return (data ?? []).map(row => ({ userId: row.user_id, displayName: row.display_name, relation: row.relation as Friend['relation'] }));
}

// ---------------------------------------------------------------- plan invites

export type Invite = { planId: string; planTitle: string; planDate: string | null; fromName: string; status: string; eventCount: number };

export async function inviteFriend(planId: string, friendId: string): Promise<void> {
  const { error } = await getSupabase().rpc('invite_friend', { p_plan_id: planId, p_friend: friendId });
  if (error) fail(error);
}

export async function loadInvites(): Promise<Invite[]> {
  const { data, error } = await getSupabase().rpc('my_invites');
  if (error) fail(error);
  return (data ?? []).map(row => ({
    planId: row.plan_id, planTitle: row.plan_title, planDate: row.plan_date, fromName: row.from_name, status: row.status, eventCount: row.event_count,
  }));
}

/** Joins the plan and returns its invite code (the URL segment). */
export async function acceptInvite(planId: string): Promise<string> {
  const { data, error } = await getSupabase().rpc('accept_invite', { p_plan_id: planId });
  if (error) fail(error);
  return data;
}

export async function declineInvite(planId: string): Promise<void> {
  const { error } = await getSupabase().rpc('decline_invite', { p_plan_id: planId });
  if (error) fail(error);
}
