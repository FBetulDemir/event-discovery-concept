import type { Translator } from '../i18n/locale.ts';

/** Pure helpers for the notification and friend screens (kept apart from the Supabase client so they are testable). */

export type PlanUnread = { planId: string; votes: number; comments: number; events: number; members: number; decided: boolean };

export const hasNews = (unread: PlanUnread | undefined): boolean =>
  !!unread && (unread.votes + unread.comments + unread.events + unread.members > 0 || unread.decided);

/** "2 new votes, 1 new comment", or null when there is nothing new. `t` is the root translator (plurals are ICU). */
export function describeNews(unread: PlanUnread | undefined, t: Translator): string | null {
  if (!unread || !hasNews(unread)) return null;
  const parts: string[] = [];
  if (unread.decided) parts.push(t('news.decided'));
  if (unread.votes) parts.push(t('news.votes', { count: unread.votes }));
  if (unread.comments) parts.push(t('news.comments', { count: unread.comments }));
  if (unread.events) parts.push(t('news.events', { count: unread.events }));
  if (unread.members) parts.push(t('news.members', { count: unread.members }));
  return parts.join(', ');
}

/** Pulls the code out of a pasted friend link (`…/vanner?kod=abc`) or accepts a bare code. */
export function parseFriendCode(input: string): string {
  const trimmed = input.trim();
  try { return new URL(trimmed).searchParams.get('kod')?.trim() ?? ''; } catch { return trimmed; }
}
