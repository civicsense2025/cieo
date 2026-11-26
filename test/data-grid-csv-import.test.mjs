import test from 'node:test';
import assert from 'node:assert/strict';
import { importCsv, exportCsv, numericValue, cellOf, CSV_IMPORT_LIMITS } from '../dist/data-grid/index.js';

const quoted = (value) => `"${String(value).replace(/"/g, '""')}"`;

/** The type importCsv infers for the second column when it holds these values. */
function typeOf(values) {
  const result = importCsv(['X,Y', ...values.map((value) => `a,${quoted(value)}`)].join('\n'));
  assert.equal(result.ok, true);
  return result.properties[1].type;
}

test('the limits are 2000 rows and 40 columns', () => {
  assert.deepEqual(CSV_IMPORT_LIMITS, { rows: 2000, columns: 40 });
});

test('header names are trimmed, a blank name becomes "Column N", and repeated names stay distinct', () => {
  const result = importCsv('Name, ,Name,Name 2,A,A,A 2\n1,2,3,4,5,6,7\n');
  assert.equal(result.ok, true);
  const names = result.properties.map((def) => def.name);
  assert.deepEqual(names, ['Name', 'Column 2', 'Name 2', 'Name 2 2', 'A', 'A 2', 'A 2 2']);
  assert.equal(new Set(names).size, names.length);
});

test('the first column is always text, even when every value looks like a number', () => {
  const result = importCsv('ID,Pages\n1,10\n2,20\n3,30\n4,40\n');
  assert.equal(result.properties[0].type, 'text');
  assert.equal(result.properties[1].type, 'number');
  assert.deepEqual(result.rows.map((row) => row.values.c0), ['1', '2', '3', '4']);
});

test('a column of plain decimals is a number; codes with leading zeros, separators and words stay text', () => {
  assert.equal(typeOf(['1', '-2.5', '.5', '1e3']), 'number');
  assert.equal(typeOf(['1', '1,234']), 'text');
  assert.equal(typeOf(['007', '008', '009', '010']), 'text');
  assert.equal(typeOf(['1', 'two']), 'text');
});

test('a column is numeric exactly when the number reader accepts every value', () => {
  for (const value of ['007', '1,234', '1.', '.5', '-0', '+7', '1e3', '1e400', ' 9 ', 'NaN', '12abc']) {
    assert.equal(typeOf(['1', value]) === 'number', numericValue(value) !== null, JSON.stringify(value));
  }
});

test('a digit string too long to be finite is not a number', () => {
  assert.equal(typeOf(['9'.repeat(400), '1']), 'text');
});

test('dates: every value must be a real YYYY-MM-DD day', () => {
  assert.equal(typeOf(['2026-11-26', '2028-02-29']), 'date');
  assert.equal(typeOf(['2026-11-26', '2026-02-30']), 'text');
  assert.equal(typeOf(['2026-11-26', 'soon']), 'text');
});

test('checkboxes: true, false, yes and no in any letter case; a blank cell stays blank, not false', () => {
  assert.equal(typeOf(['Yes', 'no', 'TRUE', 'false']), 'checkbox');
  const result = importCsv('X,Done\na,Yes\nb,\nc,no\n');
  assert.equal(result.properties[1].type, 'checkbox');
  assert.deepEqual(result.rows.map((row) => row.values.c1), [true, undefined, false]);
});

test('links: every value must be a safe http or https address', () => {
  assert.equal(typeOf(['https://a.example', 'http://b.example/x']), 'link');
  assert.equal(typeOf(['https://a.example', 'javascript:alert(1)']), 'text');
});

test('select: a few repeated values become options, listed in the order first seen', () => {
  const result = importCsv(['X,Priority', 'a,High', 'b,Low', 'c,High', 'd,Low', 'e,High'].join('\n'));
  assert.equal(result.properties[1].type, 'select');
  assert.deepEqual(result.properties[1].options, ['High', 'Low']);
  assert.equal(result.rows[1].values.c1, 'Low');
});

test('select needs at least four values, at most half of them distinct, and at most eight options', () => {
  assert.equal(typeOf(['a', 'a', 'b']), 'text');
  assert.equal(typeOf(['a', 'b', 'c', 'd']), 'text');
  assert.equal(typeOf(Array.from({ length: 16 }, (_, i) => `v${i % 8}`)), 'select');
  assert.equal(typeOf(Array.from({ length: 18 }, (_, i) => `v${i % 9}`)), 'text');
});

test('a column with no values, or with mixed kinds of value, is text', () => {
  assert.equal(typeOf(['', '']), 'text');
  assert.equal(typeOf(['1', 'a']), 'text');
});

test('typed cells are stored as typed values; text cells keep their exact spacing', () => {
  const result = importCsv('Name,Pages,Title\n"x", 12 ,"  spaced  "\n');
  assert.equal(result.rows[0].values.c1, 12);
  assert.equal(result.rows[0].values.c2, '  spaced  ');
});

test('rows get unique ids, and a short row is padded with blanks', () => {
  const result = importCsv('A,B,C\n1\n2,3,4\n');
  assert.equal(new Set(result.rows.map((row) => row.id)).size, result.rows.length);
  assert.equal(result.rows[0].values.c0, '1');
  assert.equal(cellOf(result.rows[0], 'c2'), undefined);
});

test('rows past 2000 are dropped and counted, and the kept rows are the first 2000', () => {
  const body = Array.from({ length: 2003 }, (_, i) => String(i)).join('\n');
  const result = importCsv(`Name\n${body}\n`);
  assert.equal(result.ok, true);
  assert.equal(result.rows.length, 2000);
  assert.equal(result.rows[1999].values.c0, '1999');
  assert.equal(result.report.rowsDropped, 3);
});

test('columns past 40 are dropped and counted; cells past the header are counted as ignored', () => {
  const header = Array.from({ length: 45 }, (_, i) => `c${i}`).join(',');
  const row = Array.from({ length: 45 }, (_, i) => String(i)).join(',');
  const wide = importCsv(`${header}\n${row}\n`);
  assert.equal(wide.properties.length, 40);
  assert.equal(wide.report.columnsDropped, 5);
  assert.equal(wide.report.ignoredCells, 0);
  const longRow = importCsv('A,B\n1,2,3,,5\n');
  assert.equal(longRow.properties.length, 2);
  assert.equal(longRow.report.ignoredCells, 2);
});

test('empty lines are counted and skipped, and a header alone imports zero rows', () => {
  assert.equal(importCsv('A\n\n1\n\n').report.blankLines, 2);
  const headerOnly = importCsv('Name,Pages\n');
  assert.equal(headerOnly.ok, true);
  assert.equal(headerOnly.rows.length, 0);
  assert.equal(headerOnly.properties.length, 2);
});

test('text with no records is "empty", and an unterminated quote is refused with its reason', () => {
  assert.deepEqual(importCsv(''), { ok: false, reason: 'empty' });
  assert.deepEqual(importCsv('\n\n'), { ok: false, reason: 'empty' });
  assert.deepEqual(importCsv('a,"b\n'), { ok: false, reason: 'unterminated-quote' });
});

test('a cell that export protected is restored; an apostrophe that protects nothing is kept', () => {
  const result = importCsv('Id,Note\n1,"\'=1+1"\n2,\'hello\n3,"\'-5"\n');
  assert.deepEqual(result.rows.map((row) => row.values.c1), ['=1+1', "'hello", "'-5"]);
});

test('export then import keeps every text cell exactly, for tricky values', () => {
  const tricky = [
    'line1\nline2', 'crlf\r\ninside', 'say "hi", twice', '  padded  ', "'=x", '=x', '-5', '-abc',
    '', "''=x", '+1', '@x', '\tTab', 'plain',
  ];
  const columns = [{ id: 'c0', name: 'Text', type: 'text' }];
  const rows = tricky.map((value, i) => ({ id: `r${i}`, values: value === '' ? {} : { c0: value } }));
  const back = importCsv(exportCsv(columns, rows));
  assert.equal(back.ok, true);
  assert.equal(back.rows.length, tricky.length);
  assert.deepEqual(back.rows.map((row) => row.values.c0 ?? ''), tricky);
});

test('a typed table comes back with the same CSV text after one more export', () => {
  const columns = [
    { id: 'c0', name: 'Name', type: 'text' },
    { id: 'c1', name: 'Pages', type: 'number' },
    { id: 'c2', name: 'Done', type: 'checkbox' },
    { id: 'c3', name: 'Due', type: 'date' },
  ];
  const rows = [
    { id: 'a', values: { c0: 'Dune', c1: 412, c2: true, c3: '2026-11-26' } },
    { id: 'b', values: { c0: 'Emma' } },
  ];
  const csv = exportCsv(columns, rows);
  const back = importCsv(csv);
  assert.equal(back.ok, true);
  assert.equal(exportCsv(back.properties, back.rows), csv);
});
