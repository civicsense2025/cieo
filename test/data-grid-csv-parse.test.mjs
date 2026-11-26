import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../dist/data-grid/index.js';

const ALL = 1_000_000;

test('rows split on LF, CRLF and bare CR, and a trailing line break adds no row', () => {
  for (const text of ['a,b\nc,d\n', 'a,b\r\nc,d\r\n', 'a,b\rc,d\r']) {
    assert.deepEqual(parseCsv(text, ALL).records, [['a', 'b'], ['c', 'd']], JSON.stringify(text));
  }
  assert.deepEqual(parseCsv('a,b', ALL).records, [['a', 'b']]);
});

test('quoted fields keep commas, doubled quotes and line breaks exactly, with LF or CRLF inside', () => {
  assert.deepEqual(parseCsv('"a,1","say ""hi""","line1\nline2"\r\n', ALL).records, [['a,1', 'say "hi"', 'line1\nline2']]);
  assert.deepEqual(parseCsv('"x\r\ny",z', ALL).records, [['x\r\ny', 'z']]);
});

test('a quote in the middle of an unquoted field is a literal character', () => {
  assert.deepEqual(parseCsv('ab"c,d', ALL).records, [['ab"c', 'd']]);
});

test('text after a closing quote joins the same field', () => {
  assert.deepEqual(parseCsv('"ab"cd,e', ALL).records, [['abcd', 'e']]);
});

test('empty lines are counted and skipped, while a quoted empty field and a lone comma are real rows', () => {
  const parsed = parseCsv('a\n\n""\n,\n', ALL);
  assert.deepEqual(parsed.records, [['a'], [''], ['', '']]);
  assert.equal(parsed.blankLines, 1);
});

test('a leading byte-order mark is not part of the first cell', () => {
  assert.deepEqual(parseCsv('﻿Name,Pages\n', ALL).records, [['Name', 'Pages']]);
});

test('an unterminated quote is reported and yields no records', () => {
  const parsed = parseCsv('a,"b\nc,d\n', ALL);
  assert.equal(parsed.unterminatedQuote, true);
  assert.deepEqual(parsed.records, []);
});

test('empty text has no records and no problem', () => {
  const parsed = parseCsv('', ALL);
  assert.deepEqual(parsed.records, []);
  assert.equal(parsed.unterminatedQuote, false);
  assert.equal(parsed.droppedRecords, 0);
});

test('records past the limit are counted and not stored, so a huge file stays bounded', () => {
  const parsed = parseCsv('h\n1\n2\n3\n4\n5\n', 3);
  assert.deepEqual(parsed.records, [['h'], ['1'], ['2']]);
  assert.equal(parsed.droppedRecords, 3);
});

test('a quoted multi-line record past the limit is counted once, with its quotes read correctly', () => {
  const parsed = parseCsv('h\n1\n"x\ny"\n', 2);
  assert.deepEqual(parsed.records, [['h'], ['1']]);
  assert.equal(parsed.droppedRecords, 1);
});
