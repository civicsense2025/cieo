import test from 'node:test';
import assert from 'node:assert/strict';
import { sortRows } from '../dist/data-grid/index.js';

const row = (id, values) => ({ id, values });
const ids = (rows) => rows.map((r) => r.id);
const asc = (property) => [{ property, direction: 'asc' }];
const desc = (property) => [{ property, direction: 'desc' }];

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

test('numbers sort by value, not by their text: 9 comes before 10', () => {
  const rows = [row('a', { n: '10' }), row('b', { n: 9 }), row('c', { n: '100' })];
  assert.deepEqual(ids(sortRows(rows, props, asc('n'))), ['b', 'a', 'c']);
  assert.deepEqual(ids(sortRows(rows, props, desc('n'))), ['c', 'a', 'b']);
});

test('select and status sort by option order, not alphabetically; an unlisted value sorts after every option', () => {
  const rows = [row('h', { s: 'High' }), row('x', { s: 'Zzz' }), row('l', { s: 'Low' }), row('m', { s: 'Medium' })];
  assert.deepEqual(ids(sortRows(rows, props, asc('s'))), ['l', 'm', 'h', 'x']);
  assert.deepEqual(ids(sortRows(rows, props, desc('s'))), ['x', 'h', 'm', 'l']);
  const stages = [row('d', { st: 'Done' }), row('i', { st: 'Idea' })];
  assert.deepEqual(ids(sortRows(stages, props, asc('st'))), ['i', 'd']);
});

test('dates sort as calendar days; a value that is not a real date sorts with the empties', () => {
  const rows = [row('b', { d: '2027-01-05' }), row('bad', { d: '2026-02-30' }), row('a', { d: '2026-12-31' }), row('e', {})];
  assert.deepEqual(ids(sortRows(rows, props, asc('d'))), ['a', 'b', 'bad', 'e']);
  assert.deepEqual(ids(sortRows(rows, props, desc('d'))), ['b', 'a', 'bad', 'e']);
});

test('checkboxes sort unchecked before checked; a missing value is last in both directions', () => {
  const rows = [row('t', { c: true }), row('none', {}), row('f', { c: false })];
  assert.deepEqual(ids(sortRows(rows, props, asc('c'))), ['f', 't', 'none']);
  assert.deepEqual(ids(sortRows(rows, props, desc('c'))), ['t', 'f', 'none']);
});

test('text sorts naturally (file2 before file10), and letter case alone does not reorder', () => {
  const rows = [row('10', { t: 'file10' }), row('2', { t: 'file2' }), row('A', { t: 'Apple' }), row('a', { t: 'apple' })];
  assert.deepEqual(ids(sortRows(rows, props, asc('t'))), ['A', 'a', '2', '10']);
});

test('empty values are always last, in ascending and descending order alike, for every property type', () => {
  const samples = {
    text: ['b', 'a'], number: [2, 1], select: ['Medium', 'Low'], status: ['Doing', 'Idea'],
    date: ['2026-02-01', '2026-01-01'], checkbox: [true, false],
    link: ['https://b.example', 'https://a.example'], relation: ['n2', 'n1'],
  };
  for (const def of props) {
    const [high, low] = samples[def.type];
    const rows = [
      row('e1', { [def.id]: '' }), row('f1', { [def.id]: high }), row('e2', { [def.id]: null }),
      row('f2', { [def.id]: low }), row('e3', { [def.id]: NaN }), row('e4', {}), row('e5', { [def.id]: '   ' }),
    ];
    assert.deepEqual(ids(sortRows(rows, [def], asc(def.id))), ['f2', 'f1', 'e1', 'e2', 'e3', 'e4', 'e5'], `${def.type} asc`);
    assert.deepEqual(ids(sortRows(rows, [def], desc(def.id))), ['f1', 'f2', 'e1', 'e2', 'e3', 'e4', 'e5'], `${def.type} desc`);
  }
});

test('a non-numeric value in a number column sorts with the empties and never breaks the order', () => {
  const rows = [row('x', { n: 'oops' }), row('2', { n: '2' }), row('nan', { n: NaN }), row('1', { n: 1 })];
  assert.deepEqual(ids(sortRows(rows, [P.n], asc('n'))), ['1', '2', 'x', 'nan']);
  assert.deepEqual(ids(sortRows(rows, [P.n], desc('n'))), ['2', '1', 'x', 'nan']);
});

test('later sort keys break ties with their own direction, and a missing first key still orders by the second', () => {
  const rows = [
    row('a', { s: 'Low', n: 1 }), row('b', { s: 'High', n: 1 }), row('c', { s: 'Low', n: 2 }),
    row('d', { n: 5 }), row('e', { n: 3 }),
  ];
  const sorts = [{ property: 's', direction: 'asc' }, { property: 'n', direction: 'desc' }];
  assert.deepEqual(ids(sortRows(rows, props, sorts)), ['c', 'a', 'b', 'd', 'e']);
});

test('equal rows keep their input order, the input array is not changed, and the same row objects come back', () => {
  const rows = [row('first', { s: 'Low' }), row('second', { s: 'Low' }), row('third', { s: 'Low' })];
  const before = [...rows];
  const out = sortRows(rows, props, desc('s'));
  assert.deepEqual(ids(out), ['first', 'second', 'third']);
  assert.deepEqual(rows, before);
  assert.notEqual(out, rows);
  assert.equal(out[0], rows[0]);
});

test('a sort on a property the schema lacks is ignored, and no sort rules keeps the input order', () => {
  const rows = [row('b', { t: 'b' }), row('a', { t: 'a' })];
  assert.deepEqual(ids(sortRows(rows, props, asc('gone'))), ['b', 'a']);
  assert.deepEqual(ids(sortRows(rows, props, [])), ['b', 'a']);
});
