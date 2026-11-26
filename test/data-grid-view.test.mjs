import test from 'node:test';
import assert from 'node:assert/strict';
import { applyView } from '../dist/data-grid/index.js';

const row = (id, values) => ({ id, values });
const ids = (rows) => rows.map((r) => r.id);
const props = [
  { id: 's', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
  { id: 'n', name: 'Pages', type: 'number' },
];

test('a view filters first, then sorts only the rows that are left', () => {
  const rows = [
    row('a', { s: 'High', n: 1 }), row('b', { s: 'Low', n: 3 }), row('c', { s: 'High', n: 2 }), row('d', { s: 'High', n: 9 }),
  ];
  const view = {
    filters: [{ property: 's', operator: 'is', value: 'High' }],
    sorts: [{ property: 'n', direction: 'desc' }],
  };
  assert.deepEqual(ids(applyView(rows, props, view)), ['d', 'c', 'a']);
});

test('an empty view keeps every row in its original order, and the input array is not changed', () => {
  const rows = [row('b', { n: 2 }), row('a', { n: 1 })];
  const out = applyView(rows, props);
  assert.deepEqual(ids(out), ['b', 'a']);
  assert.notEqual(out, rows);
  assert.deepEqual(ids(rows), ['b', 'a']);
});

test('a view can sort without filters, or filter without sorts', () => {
  const rows = [row('b', { n: 2 }), row('a', { n: 1 })];
  assert.deepEqual(ids(applyView(rows, props, { sorts: [{ property: 'n', direction: 'asc' }] })), ['a', 'b']);
  assert.deepEqual(ids(applyView(rows, props, { filters: [{ property: 'n', operator: 'gt', value: '1' }] })), ['b']);
});
