import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  PROPERTY_TYPES, isPropertyType, isEmptyValue, displayText, numericValue, isIsoDate, isoDayOf,
  safeLinkHref, cellOf, indexProperties, convertValue,
} from '../dist/data-grid/index.js';

test('isoDayOf returns the trimmed day only for a real YYYY-MM-DD string', () => {
  assert.equal(isoDayOf(' 2026-11-26 '), '2026-11-26');
  for (const bad of ['2026-02-30', 'soon', '', undefined, null, 20261126, true]) {
    assert.equal(isoDayOf(bad), null, String(bad));
  }
});

test('the property model has exactly the eight types', () => {
  assert.deepEqual([...PROPERTY_TYPES].sort(), ['checkbox', 'date', 'link', 'number', 'relation', 'select', 'status', 'text']);
  for (const type of PROPERTY_TYPES) assert.equal(isPropertyType(type), true, type);
  for (const bad of ['note', 'url', 'Text', '', 'constructor', '__proto__', 'toString', null, 3]) {
    assert.equal(isPropertyType(bad), false, String(bad));
  }
});

test('the logic is a public subpath export built to dist', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.deepEqual(pkg.exports['./data-grid'], { types: './dist/data-grid/index.d.ts', default: './dist/data-grid/index.js' });
  assert.equal(existsSync('dist/data-grid/index.js'), true);
});

test('empty means no usable value: undefined, null, blank text and non-finite numbers; false and 0 are values', () => {
  for (const value of [undefined, null, '', '   ', '\t', NaN, Infinity, -Infinity]) {
    assert.equal(isEmptyValue(value), true, String(value));
  }
  for (const value of [0, false, true, 'x', ' 0 ', -5]) assert.equal(isEmptyValue(value), false, String(value));
});

test('display text: checkboxes read yes or no, numbers print plainly, missing is blank, NaN never prints', () => {
  assert.equal(displayText('checkbox', true), 'yes');
  assert.equal(displayText('checkbox', false), 'no');
  assert.equal(displayText('checkbox', undefined), '');
  assert.equal(displayText('number', 12.5), '12.5');
  assert.equal(displayText('number', NaN), '');
  assert.equal(displayText('text', '  padded  '), '  padded  ');
  assert.equal(displayText('text', '   '), '');
});

test('a relation shows its label when the resolver knows the id, and the id otherwise', () => {
  const labels = new Map([['n1', 'Reading list']]);
  assert.equal(displayText('relation', 'n1', (id) => labels.get(id)), 'Reading list');
  assert.equal(displayText('relation', 'n9', (id) => labels.get(id)), 'n9');
  assert.equal(displayText('relation', 'n1'), 'n1');
});

test('numbers are read strictly: no partial reads, no separators, no leading zeros, nothing non-finite', () => {
  assert.equal(numericValue('12'), 12);
  assert.equal(numericValue(' -3.5 '), -3.5);
  assert.equal(numericValue('.5'), 0.5);
  assert.equal(numericValue('1e3'), 1000);
  assert.equal(numericValue(0), 0);
  for (const bad of ['12abc', '1,234', '007', '1.', '', '   ', 'NaN', 'Infinity', '0x1F', '1e400', '--1', 'abc', ' 1 2 ']) {
    assert.equal(numericValue(bad), null, JSON.stringify(bad));
  }
  for (const bad of [NaN, Infinity, true, false, undefined, null]) assert.equal(numericValue(bad), null, String(bad));
});

test('ISO dates must be real calendar days written YYYY-MM-DD', () => {
  for (const ok of ['2026-11-26', '2028-02-29', '0050-01-01', '2026-12-31']) assert.equal(isIsoDate(ok), true, ok);
  for (const bad of ['2026-02-29', '2026-02-30', '2026-11-31', '2026-13-01', '2026-00-10', '2026-1-01', '26-11-26', '2026/11/26', ' 2026-11-26', '2026-11-26T00:00:00Z', '']) {
    assert.equal(isIsoDate(bad), false, JSON.stringify(bad));
  }
});

test('a link is safe only as an http or https address with no spaces, quotes, angle brackets or control characters', () => {
  assert.equal(safeLinkHref('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(safeLinkHref('  https://example.com  '), 'https://example.com');
  assert.equal(safeLinkHref('HTTP://EXAMPLE.COM'), 'HTTP://EXAMPLE.COM');
  for (const bad of [
    'javascript:alert(1)', 'data:text/html,hi', 'ftp://example.com', 'mailto:a@b.c', '//example.com',
    'https://', 'https:/example.com', 'https://example.com/a b', 'https://ex.com/<x>', 'https://ex.com/"x"',
    "https://ex.com/'x'", 'https://ex.com/\u0007x', 'https://ex.com/\nx', 'https://exa mple.com', '',
  ]) {
    assert.equal(safeLinkHref(bad), null, JSON.stringify(bad));
  }
});

test('a row reads only its own values, so a property named like an Object.prototype key is simply missing', () => {
  const row = { id: 'r1', values: { c0: 'x' } };
  assert.equal(cellOf(row, 'c0'), 'x');
  for (const key of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
    assert.equal(cellOf(row, key), undefined, key);
  }
  assert.equal(isEmptyValue(cellOf(row, 'constructor')), true);
});

test('a property id appears once: a duplicate id throws instead of guessing which column is meant', () => {
  const index = indexProperties([{ id: 'c0', name: 'A', type: 'text' }, { id: 'c1', name: 'B', type: 'number' }]);
  assert.equal(index.get('c1').name, 'B');
  assert.equal(index.get('toString'), undefined);
  assert.throws(
    () => indexProperties([{ id: 'c0', name: 'A', type: 'text' }, { id: 'c0', name: 'B', type: 'text' }]),
    RangeError,
  );
});

test('retyping keeps what can be read, clears what cannot, and never invents a value', () => {
  assert.equal(convertValue('yes', 'checkbox'), true);
  assert.equal(convertValue('TRUE', 'checkbox'), true);
  assert.equal(convertValue(' x ', 'checkbox'), true);
  assert.equal(convertValue('maybe', 'checkbox'), false);
  assert.equal(convertValue('', 'checkbox'), undefined);
  assert.equal(convertValue(undefined, 'checkbox'), undefined);
  assert.equal(convertValue(true, 'text'), 'yes');
  assert.equal(convertValue(false, 'text'), 'no');
  assert.equal(convertValue(12, 'text'), '12');
  assert.equal(convertValue(NaN, 'text'), undefined);
  assert.equal(convertValue('12.5', 'number'), 12.5);
  assert.equal(convertValue('12abc', 'number'), undefined);
  assert.equal(convertValue('2026-11-26', 'date'), '2026-11-26');
  assert.equal(convertValue('2026-02-30', 'date'), undefined);
  assert.equal(convertValue('Tuesday', 'select'), 'Tuesday');
  assert.equal(convertValue('https://a.example', 'link'), 'https://a.example');
  assert.equal(convertValue(3, 'relation'), '3');
});
