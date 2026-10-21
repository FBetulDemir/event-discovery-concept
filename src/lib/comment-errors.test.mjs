import assert from 'node:assert/strict';
import test from 'node:test';
import { reactionNeedsProfile } from './comment-errors.ts';

test('a reaction by a visitor without a profile requests name setup', () => {
  assert.equal(reactionNeedsProfile({ code: '23503', message: 'insert or update on table "comment_reactions" violates foreign key constraint "comment_reactions_user_id_fkey"' }), true);
});

test('missing comments and permission failures do not prompt for a name', () => {
  assert.equal(reactionNeedsProfile({ code: '23503', message: 'comment_reactions_comment_id_fkey' }), false);
  assert.equal(reactionNeedsProfile({ code: '42501', message: 'new row violates row-level security policy' }), false);
});
