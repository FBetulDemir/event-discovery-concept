/** Pure helpers for the notification and friend screens (kept apart from the Supabase client so they are testable). */

export type PlanUnread = { planId: string; votes: number; comments: number; events: number; members: number; decided: boolean };

export const hasNews = (unread: PlanUnread | undefined): boolean =>
  !!unread && (unread.votes + unread.comments + unread.events + unread.members > 0 || unread.decided);

/** "2 nya röster, 1 ny kommentar", or null when there is nothing new. */
export function describeNews(unread: PlanUnread | undefined): string | null {
  if (!unread || !hasNews(unread)) return null;
  const parts: string[] = [];
  if (unread.decided) parts.push('Planen är avgjord');
  if (unread.votes) parts.push(`${unread.votes} ${unread.votes === 1 ? 'ny röst' : 'nya röster'}`);
  if (unread.comments) parts.push(`${unread.comments} ${unread.comments === 1 ? 'ny kommentar' : 'nya kommentarer'}`);
  if (unread.events) parts.push(`${unread.events} ${unread.events === 1 ? 'nytt alternativ' : 'nya alternativ'}`);
  if (unread.members) parts.push(`${unread.members} ${unread.members === 1 ? 'ny medlem' : 'nya medlemmar'}`);
  return parts.join(', ');
}

/** Pulls the code out of a pasted friend link (`…/vanner?kod=abc`) or accepts a bare code. */
export function parseFriendCode(input: string): string {
  const trimmed = input.trim();
  try { return new URL(trimmed).searchParams.get('kod')?.trim() ?? ''; } catch { return trimmed; }
}
