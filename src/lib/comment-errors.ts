/** A new visitor has an auth user but may not have named a profile yet. */
export function reactionNeedsProfile(error: { code?: string; message: string }): boolean {
  return error.code === '23503' && error.message.includes('comment_reactions_user_id_fkey');
}
