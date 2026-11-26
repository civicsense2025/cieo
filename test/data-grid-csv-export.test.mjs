import test from 'node:test';
import assert from 'node:assert/strict';
import { exportCsv } from '../dist/data-grid/index.js';

const COLUMNS = [
  { id: 'c0', name: 'Name', type: 'text' },
  { id: 'c1', name: 'Pages', type: 'number' },
  { id: 'c2', name: 'Done', type: 'checkbox' },
  { id: 'c3', name: 'Due', type: 'date' },
];

test('export writes a header of property names, then one line per row, joined with CRLF and no trailing line break', () => {
  const rows = [
    { id: 'r1', values: { c0: 'Dune', c1: 412, c2: true, c3: '2026-11-26' } },
    { id: 'r2', values: { c0: 'Emma' } },
  ];
  assert.equal(exportCsv(COLUMNS, rows), 'Name,Pages,Done,Due\r\nDune,412,true,2026-11-26\r\nEmma,,,');
});

test('a checkbox exports as true or false, and a missing checkbox exports as blank', () => {
  const rows = [{ id: 'a', values: { c2: false } }, { id: 'b', values: {} }];
  assert.equal(exportCsv([COLUMNS[2]], rows), 'Done\r\nfalse\r\n""');
  assert.equal(exportCsv([COLUMNS[2]], [{ id: 'c', values: { c2: true } }]), 'Done\r\ntrue');
});

test('fields with commas, quotes or line breaks are quoted, and quotes are doubled', () => {
  const rows = [{ id: 'r', values: { c0: 'a,b', c1: 'say "x"', c3: 'line1\nline2' } }];
  assert.equal(exportCsv(COLUMNS, rows), 'Name,Pages,Done,Due\r\n"a,b","say ""x""",,"line1\nline2"');
});

test('a cell that would start a formula gets one apostrophe, so a spreadsheet shows it as text', () => {
  const texts = ['=1+1', '+1', '@SUM(A1)', '\tx', '-x', '-', "-2+3+cmd|' /C calc'!A0", ' =x'];
  const rows = texts.map((text, i) => ({ id: `r${i}`, values: { c0: text } }));
  assert.deepEqual(
    exportCsv([COLUMNS[0]], rows).split('\r\n').slice(1),
    ["'=1+1", "'+1", "'@SUM(A1)", "'\tx", "'-x", "'-", "'-2+3+cmd|' /C calc'!A0", "' =x"],
  );
});

test('plain words, numbers and negative numbers are written unchanged', () => {
  const texts = ['Apple', '-5', '-.5', '5', 'a=b', ' Apple', '007'];
  const rows = texts.map((text, i) => ({ id: `r${i}`, values: { c0: text } }));
  assert.deepEqual(exportCsv([COLUMNS[0]], rows).split('\r\n').slice(1), texts);
});

test('a row whose only cell is empty is written as "" so it is not read back as a blank line', () => {
  assert.equal(exportCsv([COLUMNS[0]], [{ id: 'r', values: {} }]), 'Name\r\n""');
});

test('property names get the same protection as cells', () => {
  assert.equal(exportCsv([{ id: 'c0', name: '=SUM(1)', type: 'text' }], []), "'=SUM(1)");
});
