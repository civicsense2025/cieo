// Pins the editorial-frame primitives' truth rules, matching their CieoUI twins.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pageBounds } from '../dist/primitives/ReferenceText/ReferenceText.js';
import { stepState } from '../dist/primitives/StepList/StepList.js';
import { shareFractions } from '../dist/primitives/ShareBar/ShareBar.js';
import { rankLabel, barFraction } from '../dist/primitives/IndexRow/IndexRow.js';
import { rollColumns } from '../dist/primitives/RollCall/RollCall.js';

test('a page count never shows page 0 or a page past the total', () => {
  assert.deepEqual(pageBounds(4, 18), [4, 18]);
  assert.deepEqual(pageBounds(0, 18), [1, 18]);
  assert.deepEqual(pageBounds(25, 18), [18, 18]);
  assert.deepEqual(pageBounds(3, 0), [1, 1]);
  assert.deepEqual(pageBounds(Number.NaN, 5), [1, 5]);
});

test('step states follow the current step and clamp a stale index', () => {
  assert.equal(stepState(0, 1, 4), 'done');
  assert.equal(stepState(1, 1, 4), 'current');
  assert.equal(stepState(3, 1, 4), 'upcoming');
  assert.equal(stepState(3, 9, 4), 'current');
  assert.equal(stepState(0, -2, 4), 'current');
});

test('a share bar draws nothing unless every share is real', () => {
  assert.deepEqual(shareFractions([73, 25]).map((f) => Math.round(f * 100)), [74, 26]);
  assert.equal(shareFractions([73, 0]), null);
  assert.equal(shareFractions([73, Number.NaN]), null);
  assert.equal(shareFractions([-1, 3]), null);
  assert.equal(shareFractions([100]), null);
});

test('ranks are two digits and bars clamp to the row', () => {
  assert.equal(rankLabel(1), '01');
  assert.equal(rankLabel(12), '12');
  assert.equal(rankLabel(0), '01');
  assert.equal(barFraction(1.4), 1);
  assert.equal(barFraction(-1), 0);
  assert.equal(barFraction(Number.NaN), null);
  assert.equal(barFraction(undefined), null);
});

test('roll-call columns stay between one and four', () => {
  assert.equal(rollColumns(3), 3);
  assert.equal(rollColumns(0), 1);
  assert.equal(rollColumns(9), 4);
  assert.equal(rollColumns(Number.NaN), 3);
});
