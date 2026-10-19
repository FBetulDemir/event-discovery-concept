import assert from 'node:assert/strict';
import test from 'node:test';
import { tallyVotes, outcomeOf, nextVote } from './voting.ts';

const ids = ['a', 'b', 'c'];

test('tally keeps shortlist order, counts every event and ignores votes for unknown events', () => {
  const tally = tallyVotes(ids, [{ planEventId: 'b' }, { planEventId: 'b' }, { planEventId: 'a' }, { planEventId: 'gone' }]);
  assert.deepEqual(tally, [
    { planEventId: 'a', votes: 1 }, { planEventId: 'b', votes: 2 }, { planEventId: 'c', votes: 0 },
  ]);
});

test('a single leader wins', () => {
  assert.deepEqual(outcomeOf(tallyVotes(ids, [{ planEventId: 'c' }])), { kind: 'winner', planEventId: 'c', votes: 1 });
});

test('equal leaders are a tie, never silently resolved to the first shortlisted event', () => {
  assert.deepEqual(
    outcomeOf(tallyVotes(ids, [{ planEventId: 'a' }, { planEventId: 'c' }])),
    { kind: 'tie', planEventIds: ['a', 'c'], votes: 1 },
  );
});

test('with no votes every event ties at zero, except a lone event which wins', () => {
  assert.deepEqual(outcomeOf(tallyVotes(ids, [])), { kind: 'tie', planEventIds: ids, votes: 0 });
  assert.deepEqual(outcomeOf(tallyVotes(['only'], [])), { kind: 'winner', planEventId: 'only', votes: 0 });
});

test('an empty shortlist has no outcome', () => {
  assert.deepEqual(outcomeOf(tallyVotes([], [])), { kind: 'none' });
});

test('clicking your own choice withdraws it and clicking another moves it', () => {
  assert.equal(nextVote(null, 'a'), 'a');
  assert.equal(nextVote('a', 'a'), null);
  assert.equal(nextVote('a', 'b'), 'b');
});
