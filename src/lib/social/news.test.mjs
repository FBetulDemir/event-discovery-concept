import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeNews, hasNews, parseFriendCode } from './news.ts';
import { translatorFor } from '../../i18n/testing.mjs';

const sv = translatorFor('sv');
const en = translatorFor('en');

const quiet = { planId: 'p', votes: 0, comments: 0, events: 0, members: 0, decided: false };

test('nothing new means no news line', () => {
  assert.equal(hasNews(undefined), false);
  assert.equal(hasNews(quiet), false);
  assert.equal(describeNews(quiet, sv), null);
});

test('news is counted per kind with Swedish singular and plural', () => {
  assert.equal(describeNews({ ...quiet, votes: 1 }, sv), '1 ny röst');
  assert.equal(describeNews({ ...quiet, votes: 2, comments: 1 }, sv), '2 nya röster, 1 ny kommentar');
  assert.equal(describeNews({ ...quiet, events: 3, members: 1 }, sv), '3 nya alternativ, 1 ny medlem');
});

test('news in English pluralises the same way', () => {
  assert.equal(describeNews({ ...quiet, votes: 1 }, en), '1 new vote');
  assert.equal(describeNews({ ...quiet, votes: 2, comments: 1 }, en), '2 new votes, 1 new comment');
  assert.equal(describeNews({ ...quiet, decided: true, members: 3 }, en), 'The plan is decided, 3 new members');
});

test('a decided plan is news on its own and comes first', () => {
  assert.equal(hasNews({ ...quiet, decided: true }), true);
  assert.equal(describeNews({ ...quiet, decided: true, votes: 1 }, sv), 'Planen är avgjord, 1 ny röst');
});

test('a friend code is read from a link or taken as typed', () => {
  assert.equal(parseFriendCode('https://gänget.example/vanner?kod=abc123'), 'abc123');
  assert.equal(parseFriendCode('  abc123 '), 'abc123');
  assert.equal(parseFriendCode('https://example.com/vanner'), '');
});
