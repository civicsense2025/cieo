import test from 'node:test';
import assert from 'node:assert/strict';
import { filterRows, OPERATORS_BY_TYPE } from '../dist/data-grid/index.js';

const row = (id, values) => ({ id, values });
const ids = (rows) => rows.map((r) => r.id);

const P = {
  n: { id: 'n', name: 'Pages', type: 'number' },
  t: { id: 't', name: 'Title', type: 'text' },
  s: { id: 's', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
  st: { id: 'st', name: 'Stage', type: 'status', options: ['Idea', 'Doing', 'Done'] },
  d: { id: 'd', name: 'Due', type: 'date' },
  c: { id: 'c', name: 'Done', type: 'checkbox' },
  l: { id: 'l', name: 'Link', type: 'link' },
  r: { id: 'r', name: 'Related', type: 'relation' },
};
const props = Object.values(P);
const rule = (property, operator, value) => (value === undefined ? { property, operator } : { property, operator, value });

test('each property type offers exactly its operators', () => {
  assert.deepEqual(OPERATORS_BY_TYPE.text, ['contains', 'is', 'isNot', 'isEmpty', 'isNotEmpty']);
  assert.deepEqual(OPERATORS_BY_TYPE.number, ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'isEmpty', 'isNotEmpty']);
  assert.deepEqual(OPERATORS_BY_TYPE.select, ['is', 'isNot', 'isEmpty', 'isNotEmpty']);
  assert.deepEqual(OPERATORS_BY_TYPE.status, ['is', 'isNot', 'isEmpty', 'isNotEmpty']);
  assert.deepEqual(OPERATORS_BY_TYPE.date, ['is', 'before', 'after', 'isEmpty', 'isNotEmpty']);
  assert.deepEqual(OPERATORS_BY_TYPE.checkbox, ['checked', 'unchecked']);
  assert.deepEqual(OPERATORS_BY_TYPE.link, OPERATORS_BY_TYPE.text);
  assert.deepEqual(OPERATORS_BY_TYPE.relation, OPERATORS_BY_TYPE.text);
});

test('text rules ignore letter case and surrounding spaces; contains is a substring test', () => {
  const rows = [row('a', { t: 'Apple Pie' }), row('b', { t: 'apple' }), row('c', { t: 'Banana' }), row('d', {})];
  const f = (operator, value) => ids(filterRows(rows, props, [rule('t', operator, value)]));
  assert.deepEqual(f('contains', ' PIE '), ['a']);
  assert.deepEqual(f('is', 'APPLE'), ['b']);
  assert.deepEqual(f('isNot', 'apple'), ['a', 'c', 'd']);
  assert.deepEqual(f('isEmpty'), ['d']);
  assert.deepEqual(f('isNotEmpty'), ['a', 'b', 'c']);
});

test('link and relation rules use the text operators on the stored text', () => {
  const links = [row('a', { l: 'https://a.example/x' }), row('b', { l: 'https://b.test' })];
  assert.deepEqual(ids(filterRows(links, props, [rule('l', 'contains', 'EXAMPLE')])), ['a']);
  const related = [row('a', { r: 'n1' }), row('b', { r: 'n2' })];
  assert.deepEqual(ids(filterRows(related, props, [rule('r', 'is', 'n2')])), ['b']);
});

test('number rules read numbers and numeric text; empty and non-numeric cells never match a comparison', () => {
  const rows = [
    row('a', { n: 5 }), row('b', { n: '10' }), row('c', { n: '1,000' }),
    row('d', {}), row('e', { n: 'oops' }), row('f', { n: 0 }),
  ];
  const f = (operator, value) => ids(filterRows(rows, props, [rule('n', operator, value)]));
  assert.deepEqual(f('eq', '10'), ['b']);
  assert.deepEqual(f('ne', '10'), ['a', 'f']);
  assert.deepEqual(f('gt', '4'), ['a', 'b']);
  assert.deepEqual(f('lt', '5'), ['f']);
  assert.deepEqual(f('gte', '5'), ['a', 'b']);
  assert.deepEqual(f('lte', '5'), ['a', 'f']);
  assert.deepEqual(f('isEmpty'), ['d']);
  assert.deepEqual(f('isNotEmpty'), ['a', 'b', 'c', 'e', 'f']);
  assert.deepEqual(f('eq', 'abc'), ids(rows), 'a rule value that is not a number is inactive, never NaN');
});

test('select and status rules match an exact option; an empty cell is simply not that option', () => {
  const rows = [row('a', { s: 'High' }), row('b', { s: 'Low' }), row('c', {}), row('d', { s: 'Zzz' })];
  const f = (operator, value) => ids(filterRows(rows, props, [rule('s', operator, value)]));
  assert.deepEqual(f('is', 'High'), ['a']);
  assert.deepEqual(f('isNot', 'High'), ['b', 'c', 'd']);
  assert.deepEqual(f('isEmpty'), ['c']);
  assert.deepEqual(f('isNotEmpty'), ['a', 'b', 'd']);
  assert.deepEqual(f('is', 'high'), [], 'option values are case-sensitive');
});

test('date rules compare calendar days; a rule date that is not a real day is inactive', () => {
  const rows = [row('a', { d: '2026-01-01' }), row('b', { d: '2026-06-15' }), row('c', { d: '2026-02-30' }), row('e', {})];
  const f = (operator, value) => ids(filterRows(rows, props, [rule('d', operator, value)]));
  assert.deepEqual(f('is', '2026-06-15'), ['b']);
  assert.deepEqual(f('before', '2026-06-15'), ['a']);
  assert.deepEqual(f('after', '2026-01-01'), ['b']);
  assert.deepEqual(f('before', '2026-02-30'), ['a', 'b', 'c', 'e']);
  assert.deepEqual(f('isEmpty'), ['e']);
  assert.deepEqual(f('isNotEmpty'), ['a', 'b', 'c']);
});

test('checkbox rules: a missing value counts as unchecked', () => {
  const rows = [row('a', { c: true }), row('b', { c: false }), row('c', {})];
  const f = (operator) => ids(filterRows(rows, props, [rule('c', operator)]));
  assert.deepEqual(f('checked'), ['a']);
  assert.deepEqual(f('unchecked'), ['b', 'c']);
});

test('an unfinished rule with a blank value is inactive, so adding a rule never empties the table', () => {
  const rows = [row('a', { t: 'x' }), row('b', { t: '' })];
  assert.deepEqual(ids(filterRows(rows, props, [rule('t', 'is', '')])), ['a', 'b']);
  assert.deepEqual(ids(filterRows(rows, props, [rule('t', 'contains')])), ['a', 'b']);
  const numbers = [row('a', { n: 1 }), row('b', {})];
  assert.deepEqual(ids(filterRows(numbers, props, [rule('n', 'gt', '   ')])), ['a', 'b']);
});

test('rules combine with AND; no rules keeps every row; a rule on a property the schema lacks passes', () => {
  const rows = [row('a', { s: 'High', c: true }), row('b', { s: 'High', c: false }), row('c', { s: 'Low', c: true })];
  assert.deepEqual(ids(filterRows(rows, props, [rule('s', 'is', 'High'), rule('c', 'checked')])), ['a']);
  assert.deepEqual(ids(filterRows(rows, props, [])), ['a', 'b', 'c']);
  assert.deepEqual(ids(filterRows(rows, props, [rule('gone', 'is', 'x')])), ['a', 'b', 'c']);
});

test('an operator the property type does not offer is inactive, so a rule left over from a retype hides nothing', () => {
  const rows = [row('a', { t: 'x' }), row('b', { t: 'y' })];
  assert.deepEqual(ids(filterRows(rows, props, [rule('t', 'checked')])), ['a', 'b']);
  assert.deepEqual(ids(filterRows(rows, props, [rule('t', 'before', '2026-01-01')])), ['a', 'b']);
});

test('a property named like an Object.prototype key is a real property, and an unknown name is just missing', () => {
  const schema = [{ id: 'toString', name: 'Odd', type: 'text' }];
  const rows = [row('a', {}), row('b', { toString: 'hi' })];
  assert.deepEqual(ids(filterRows(rows, schema, [rule('toString', 'isEmpty')])), ['a']);
  assert.deepEqual(ids(filterRows(rows, schema, [rule('__proto__', 'isEmpty')])), ['a', 'b']);
});

test('filtering returns a new array and leaves the rows as they were', () => {
  const rows = [row('a', { t: 'x' }), row('b', { t: 'y' })];
  const before = [...rows];
  const out = filterRows(rows, props, [rule('t', 'is', 'y')]);
  assert.deepEqual(ids(out), ['b']);
  assert.notEqual(out, rows);
  assert.deepEqual(rows, before);
});
