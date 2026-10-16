// test/primitives-form-wiring.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NumberInput } from '../dist/primitives/NumberInput/NumberInput.js';
import { DateInput } from '../dist/primitives/DateInput/DateInput.js';
import { TimeInput } from '../dist/primitives/TimeInput/TimeInput.js';
import { DateTimeInput } from '../dist/primitives/DateTimeInput/DateTimeInput.js';
import { DateRangeInput } from '../dist/primitives/DateRangeInput/DateRangeInput.js';
import { ComplexSelector } from '../dist/primitives/ComplexSelector/ComplexSelector.js';
import { Typeahead } from '../dist/primitives/Typeahead/Typeahead.js';
import { TypeaheadItem } from '../dist/primitives/TypeaheadItem/TypeaheadItem.js';
import { Collapsible } from '../dist/primitives/Collapsible/Collapsible.js';
import { OverflowList } from '../dist/primitives/OverflowList/OverflowList.js';
import { Toolbar } from '../dist/primitives/Toolbar/Toolbar.js';

test('text-like inputs accept name, value and a change handler (they used to be write-only)', () => {
  assert.match(renderToStaticMarkup(h(NumberInput, { label: 'Qty', name: 'qty', value: 4, onChange() {}, min: 1 })), /name="qty"[^>]*value="4"|value="4"[^>]*name="qty"/);
  assert.match(renderToStaticMarkup(h(NumberInput, { label: 'Qty', value: null, onChange() {} })), /value=""/);
  for (const [C, v] of [[DateInput, '2026-10-16'], [TimeInput, '09:30'], [DateTimeInput, '2026-10-16T09:30']]) {
    const html = renderToStaticMarkup(h(C, { label: 'L', name: 'n', value: v, onChange() {}, disabled: true }));
    assert.ok(html.includes(`value="${v}"`) && html.includes('name="n"') && html.includes('disabled'), html);
  }
});

test('DateRangeInput shows its range, links labels to inputs, and keeps the end after the start', () => {
  const html = renderToStaticMarkup(h(DateRangeInput, { label: 'Stay', value: { start: '2026-10-01', end: '2026-10-09' }, onChange() {} }));
  assert.match(html, /value="2026-10-01"/);
  assert.match(html, /min="2026-10-01"/);
  assert.match(html, /max="2026-10-09"/);
  const ids = [...html.matchAll(/for="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, 2);
  const two = renderToStaticMarkup(h('div', null, h(DateRangeInput, { label: 'A' }), h(DateRangeInput, { label: 'B' })));
  const all = [...two.matchAll(/for="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(all).size, 4, 'two instances never share ids');
});

test('ComplexSelector reports its choice and can be preset', () => {
  const html = renderToStaticMarkup(h(ComplexSelector, { label: 'City', sections: [{ label: 'US', options: [{ value: 'nyc' }, { value: 'sf' }] }], defaultValue: 'sf', name: 'city', onChange() {} }));
  assert.match(html, /<option value="sf" selected/);
  assert.match(html, /name="city"/);
});

test('Typeahead options report selection and Escape and ArrowDown reach the host', () => {
  const html = renderToStaticMarkup(h(Typeahead, { label: 'Pick', open: true, onOpenChange() {} }, h(TypeaheadItem, { value: 'a', selected: true }, 'A'), h(TypeaheadItem, { value: 'b' }, 'B')));
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-selected="false"/);
  const s = readFileSync('src/primitives/Typeahead/Typeahead.tsx', 'utf8');
  assert.match(s, /e\.key === 'Escape'/);
  assert.match(s, /onOpenChange\?\.\(true\)/);
});

test('Collapsible links its button to its region and names the region', () => {
  const html = renderToStaticMarkup(h(Collapsible, { title: 'More', defaultOpen: true }, 'body'));
  const id = html.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(id && html.includes(`id="${id}"`));
  assert.match(html, /role="region" aria-label="More"/);
});

test('OverflowList says how many are hidden; Toolbar wires arrow keys', () => {
  assert.match(renderToStaticMarkup(h(OverflowList, { max: 1 }, h('i', null, 1), h('i', null, 2), h('i', null, 3))), /aria-label="2 more"/);
  assert.match(readFileSync('src/primitives/Toolbar/Toolbar.tsx', 'utf8'), /roveFocus/);
  assert.match(renderToStaticMarkup(h(Toolbar, { label: 'T' }, h('button', null, 'a'))), /role="toolbar"/);
});
