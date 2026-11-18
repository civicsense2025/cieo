// pollTally (atoms/web/runtime.core.js) is the one vote-to-percent rule every poll recipe uses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../atoms/web/runtime.core.js', import.meta.url), 'utf8');
const body = src.slice(src.indexOf('function pollTally'), src.indexOf('\n}', src.indexOf('function pollTally')) + 2);
const pollTally = new Function(`${body}; return pollTally;`)();
const sum = (a) => a.reduce((x, y) => x + y, 0);

test('shares are whole numbers that always sum to 100 once anyone has voted', () => {
  for (const counts of [[38, 27, 21, 14], [39, 27, 21, 14], [1, 1, 1], [2, 2, 1], [5], [1, 0, 0], [7, 3, 3, 3, 1, 1]]) {
    const { shares, total } = pollTally(counts);
    assert.equal(sum(shares), 100, JSON.stringify(counts));
    assert.ok(shares.every(Number.isInteger));
    assert.equal(total, sum(counts));
  }
});

test('no votes: zero shares, no leader', () => {
  assert.deepEqual(pollTally([0, 0, 0]), { total: 0, shares: [0, 0, 0], leader: null });
});

test('a tie at the top has no leader; a clear winner does', () => {
  assert.equal(pollTally([2, 2, 1]).leader, null);
  assert.equal(pollTally([1, 3, 2]).leader, 1);
});

test('largest remainder breaks equal remainders toward the earlier option', () => {
  assert.deepEqual(pollTally([1, 1, 1]).shares, [34, 33, 33]);
});
