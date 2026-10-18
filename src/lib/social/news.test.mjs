import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeNews, hasNews, parseFriendCode } from './news.ts';

const quiet = { planId: 'p', votes: 0, comments: 0, events: 0, members: 0, decided: false };

test('nothing new means no news line', () => {
  assert.equal(hasNews(undefined), false);
  assert.equal(hasNews(quiet), false);
  assert.equal(describeNews(quiet), null);
});

test('news is counted per kind with Swedish singular and plural', () => {
  assert.equal(describeNews({ ...quiet, votes: 1 }), '1 ny röst');
  assert.equal(describeNews({ ...quiet, votes: 2, comments: 1 }), '2 nya röster, 1 ny kommentar');
  assert.equal(describeNews({ ...quiet, events: 3, members: 1 }), '3 nya alternativ, 1 ny medlem');
});

test('a decided plan is news on its own and comes first', () => {
  assert.equal(hasNews({ ...quiet, decided: true }), true);
  assert.equal(describeNews({ ...quiet, decided: true, votes: 1 }), 'Planen är avgjord, 1 ny röst');
});

test('a friend code is read from a link or taken as typed', () => {
  assert.equal(parseFriendCode('https://gänget.example/vanner?kod=abc123'), 'abc123');
  assert.equal(parseFriendCode('  abc123 '), 'abc123');
  assert.equal(parseFriendCode('https://example.com/vanner'), '');
});
