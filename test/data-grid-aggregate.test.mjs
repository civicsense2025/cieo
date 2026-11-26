import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateValues, aggregateColumn, AGGREGATE_KINDS } from '../dist/data-grid/index.js';

test('the six calculations are count, count empty, sum, average, min and max', () => {
  assert.deepEqual([...AGGREGATE_KINDS], ['count', 'countEmpty', 'sum', 'average', 'min', 'max']);
});

test('count and count empty use the empty rule: a false checkbox is a value, while blank and NaN are not', () => {
  const values = ['1', 'x', ' ', 2, undefined, NaN, true, false];
  assert.equal(aggregateValues(values, 'count'), 5);
  assert.equal(aggregateValues(values, 'countEmpty'), 3);
});

test('sum, average, min and max read numbers only and ignore every other value', () => {
  const values = ['3', '-1.5', 'x', '1,000', ' 10 ', 2, undefined, true, NaN, '007'];
  assert.equal(aggregateValues(values, 'sum'), 13.5);
  assert.equal(aggregateValues(values, 'average'), 3.375);
  assert.equal(aggregateValues(values, 'min'), -1.5);
  assert.equal(aggregateValues(values, 'max'), 10);
});

test('an empty set has a count of zero and no sum, average, minimum or maximum, never NaN', () => {
  assert.equal(aggregateValues([], 'count'), 0);
  assert.equal(aggregateValues([], 'countEmpty'), 0);
  for (const kind of ['sum', 'average', 'min', 'max']) {
    assert.equal(aggregateValues([], kind), null, kind);
    assert.equal(aggregateValues(['x', '', NaN, undefined], kind), null, `${kind} with no numbers`);
  }
});

test('a sum or average that overflows to Infinity reports no value instead of Infinity', () => {
  const big = '9'.repeat(308);
  assert.equal(aggregateValues([big, big], 'sum'), null);
  assert.equal(aggregateValues([big, big], 'average'), null);
  assert.equal(aggregateValues([big], 'max'), Number(big));
});

test('no calculation over a messy mix returns NaN or Infinity', () => {
  const messy = ['x', NaN, Infinity, undefined, '', '1e400', 'Infinity', 'abc', '7', true];
  for (const kind of AGGREGATE_KINDS) {
    const result = aggregateValues(messy, kind);
    if (result !== null) assert.equal(Number.isFinite(result), true, kind);
  }
  assert.equal(aggregateValues(messy, 'sum'), 7);
});

test('an unknown calculation throws, because a silent guess would hide a bug', () => {
  assert.throws(() => aggregateValues([1], 'median'), RangeError);
});

test('aggregateColumn reads one property from each row, and a row without it counts as empty', () => {
  const rows = [{ id: 'a', values: { n: 4 } }, { id: 'b', values: {} }, { id: 'c', values: { n: '6' } }];
  assert.equal(aggregateColumn(rows, 'n', 'sum'), 10);
  assert.equal(aggregateColumn(rows, 'n', 'countEmpty'), 1);
  assert.equal(aggregateColumn(rows, 'n', 'max'), 6);
});
