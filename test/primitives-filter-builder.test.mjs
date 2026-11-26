// test/primitives-filter-builder.test.mjs — FilterBuilder: controlled rule rows built on the data grid model. Server markup, manifest, README and stylesheet contracts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FilterBuilder } from '../dist/primitives/FilterBuilder/FilterBuilder.js';
import { OPERATORS_BY_TYPE } from '../dist/data-grid/index.js';

const DIR = 'src/primitives/FilterBuilder';
const ALL_OPERATORS = new Set(Object.values(OPERATORS_BY_TYPE).flat());
const properties = [
  { id: 'title', name: 'Title', type: 'text' },
  { id: 'pages', name: 'Pages', type: 'number' },
  { id: 'due', name: 'Due', type: 'date' },
  { id: 'priority', name: 'Priority', type: 'select', options: ['Low', 'High'] },
  { id: 'done', name: 'Done', type: 'checkbox' },
];
const render = (extra = {}) => renderToStaticMarkup(h(FilterBuilder, { properties, value: [], onChange: () => {}, ...extra }));

// Attributes are matched one at a time, so the order React prints them in does not matter.
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'g'))].map((m) => m[1]);
const hasAttrs = (attrs, wanted) => Object.entries(wanted).every(([k, v]) => attrs.includes(` ${k}="${v}"`));
const findTag = (html, name, wanted) => tags(html, name).find((attrs) => hasAttrs(` ${attrs}`, wanted));
const buttons = (html) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => ({ attrs: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
const optionValues = (html) => [...html.matchAll(/<option\b[^>]*\bvalue="([^"]*)"/g)].map((m) => m[1]);
const optionLabel = (html, value) => html.match(new RegExp(`<option\\b[^>]*\\bvalue="${value}"[^>]*>([^<]*)</option>`))?.[1];
const operatorValues = (html) => optionValues(html).filter((v) => ALL_OPERATORS.has(v));

test('an empty list shows the empty state and an add control, and no rows', () => {
  const html = render();
  assert.match(html, /Every row is shown/);
  assert.equal(tags(html, 'li').length, 0);
  const add = buttons(html).find((b) => b.text === 'Add filter');
  assert.ok(add, 'add button');
  assert.match(add.attrs, /type="button"/);
  assert.doesNotMatch(html, /aria-disabled/);
});

test('the add control is withheld when there is no property to filter by', () => {
  const html = render({ properties: [] });
  assert.equal(buttons(html).some((b) => b.text === 'Add filter'), false);
  assert.match(html, /Every row is shown/);
});

test('the group is named, and each rule renders as a numbered row with its own remove control', () => {
  const value = [
    { property: 'title', operator: 'contains', value: 'pie' },
    { property: 'pages', operator: 'gte', value: '10' },
  ];
  const html = render({ value });
  assert.ok(findTag(html, 'div', { role: 'group', 'aria-label': 'Filters' }), 'named group');
  assert.equal(tags(html, 'li').length, 2);
  assert.doesNotMatch(html, /Every row is shown/);
  for (const n of [1, 2]) {
    assert.match(html, new RegExp(`Filter ${n} property`));
    assert.match(html, new RegExp(`Filter ${n} operator`));
    assert.ok(buttons(html).some((b) => b.text === 'Remove' && b.attrs.includes(`aria-label="Remove filter ${n}"`)), `remove ${n}`);
  }
});

test('each property type offers exactly the operators the data grid defines, in its order', () => {
  for (const def of properties) {
    const html = render({ value: [{ property: def.id, operator: OPERATORS_BY_TYPE[def.type][0] }] });
    assert.deepStrictEqual(operatorValues(html), OPERATORS_BY_TYPE[def.type], def.type);
  }
});

test('every operator has a readable label, and a host can override one', () => {
  const labels = new Map();
  for (const def of properties) {
    const html = render({ value: [{ property: def.id, operator: OPERATORS_BY_TYPE[def.type][0] }] });
    for (const op of operatorValues(html)) labels.set(op, optionLabel(html, op));
  }
  assert.deepStrictEqual([...labels.keys()].sort(), [...ALL_OPERATORS].sort());
  for (const [op, label] of labels) assert.ok(label && label.trim() !== '', `label for ${op}`);
  assert.equal(labels.get('gte'), 'Greater than or equal to');
  const overridden = render({ operatorLabels: { gte: 'At least' }, value: [{ property: 'pages', operator: 'gte', value: '1' }] });
  assert.equal(optionLabel(overridden, 'gte'), 'At least');
});

test('a number rule takes a number input, a date rule a date input, and a text rule a text input', () => {
  const input = (rule) => findTag(render({ value: [rule] }), 'input', { 'aria-label': 'Filter 1 value' });
  assert.match(input({ property: 'title', operator: 'contains', value: 'pie' }), /type="text"/);
  assert.match(input({ property: 'pages', operator: 'gte', value: '10' }), /type="number"/);
  assert.match(input({ property: 'pages', operator: 'gte', value: '10' }), /step="any"/);
  assert.match(input({ property: 'pages', operator: 'gte', value: '10' }), /value="10"/);
  assert.match(input({ property: 'due', operator: 'before', value: '2026-05-01' }), /type="date"/);
  assert.match(input({ property: 'due', operator: 'before', value: '2026-05-01' }), /value="2026-05-01"/);
});

test('a select rule chooses from its options, starting from an empty choice', () => {
  const html = render({ value: [{ property: 'priority', operator: 'is' }] });
  const values = optionValues(html);
  assert.ok(values.includes(''), 'empty choice');
  assert.ok(values.includes('Low') && values.includes('High'), 'options');
  assert.equal(findTag(html, 'input', { 'aria-label': 'Filter 1 value' }), undefined);
});

test('a stored choice that is no longer an option stays visible instead of showing the first option', () => {
  const html = render({ value: [{ property: 'priority', operator: 'is', value: 'Urgent' }] });
  assert.ok(optionValues(html).includes('Urgent'));
});

test('operators that compare nothing show no value input', () => {
  for (const rule of [{ property: 'title', operator: 'isEmpty' }, { property: 'done', operator: 'checked' }]) {
    assert.equal(findTag(render({ value: [rule] }), 'input', { 'aria-label': 'Filter 1 value' }), undefined, rule.operator);
  }
});

test('a rule whose property is missing still renders, labeled as an unknown property', () => {
  const html = render({ value: [{ property: 'removed', operator: 'is', value: 'x' }] });
  assert.match(html, /Unknown property/);
  assert.equal(tags(html, 'li').length, 1);
});

test('every button has a name, every input is labeled, and every select has a label', () => {
  const html = render({ value: [{ property: 'title', operator: 'contains', value: 'pie' }, { property: 'done', operator: 'checked' }] });
  for (const b of buttons(html)) assert.ok(b.text !== '' || /aria-label="/.test(b.attrs), `button ${b.attrs}`);
  for (const attrs of tags(html, 'input')) assert.match(attrs, /aria-label="/, 'input name');
  for (const attrs of tags(html, 'select')) {
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    assert.ok(id && html.includes(`for="${id}"`), `select ${id} has a label`);
  }
});

test('the group keeps its own classes when the host passes no customization', () => {
  const root = findTag(render(), 'div', { role: 'group' });
  assert.match(root, /class="cieo cieo-filter-builder"/);
});

test('the group takes a host label, class and root slot', () => {
  const html = render({
    label: 'Table filters', className: 'host-x', slotProps: { root: { className: 'host-y' } },
    value: [{ property: 'title', operator: 'contains', value: 'a' }],
  });
  const root = findTag(html, 'div', { role: 'group' });
  assert.match(root, /aria-label="Table filters"/);
  assert.match(root, /cieo-filter-builder/);
  assert.match(root, /host-x/);
  assert.match(root, /host-y/);
});

test('the component stays on shared tokens and timing, and names no other product', () => {
  const src = readFileSync(`${DIR}/FilterBuilder.tsx`, 'utf8');
  assert.match(src, /'use client'/);
  assert.doesNotMatch(src, /\d\s*ms\b/, 'timing comes from the motion tokens in CSS');
  assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b|rgba?\(/, 'colors come from tokens');
  assert.doesNotMatch(src, /aria-disabled|overflow:\s*hidden/);
  assert.doesNotMatch(src, /scribe|notion/i);
  assert.doesNotMatch(src, /\sdata-[a-z-]+=/, 'focus hooks are classes; data attributes belong to the customization contract');
});

test('the stylesheet uses tokens only and reads motion from the shared motion tokens', () => {
  const css = readFileSync('design/styles/primitives/filter-builder.css', 'utf8');
  assert.match(css, /@layer cieo\.components/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  assert.doesNotMatch(css, /\b\d+(\.\d+)?m?s\b/, 'no raw durations');
  for (const token of ['--motion-duration-base', '--motion-ease-spring', '--motion-drift', '--motion-arrive-opacity']) {
    assert.match(css, new RegExp(`var\\(${token}\\)`), token);
  }
  assert.match(css, /@keyframes /);
});

test('the manifest and README follow the primitive contract', () => {
  const m = JSON.parse(readFileSync(`${DIR}/manifest.json`, 'utf8'));
  assert.equal(m.id, 'core.filter-builder');
  assert.equal(m.name, 'FilterBuilder');
  assert.equal(m.packId, 'core');
  assert.equal(m.schemaVersion, '1.0.0');
  assert.deepStrictEqual(m.properties.map((p) => p.id).sort(), ['addLabel', 'className', 'emptyLabel', 'label', 'onChange', 'operatorLabels', 'properties', 'slotProps', 'value']);
  const readme = readFileSync(`${DIR}/README.md`, 'utf8');
  for (const heading of ['Keyboard / accessibility', 'Motion', 'Host customization']) assert.match(readme, new RegExp(`^## ${heading}$`, 'm'), heading);
  assert.doesNotMatch(readme, /scribe|notion/i);
});

test('the primitive is exported, published and generated like the others', () => {
  assert.match(readFileSync('src/primitives/index.ts', 'utf8'), /FilterBuilder/);
  assert.ok(JSON.parse(readFileSync('package.json', 'utf8')).exports['./FilterBuilder']);
  assert.ok(JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names.includes('FilterBuilder'));
  assert.ok(existsSync('registry/FilterBuilder/FilterBuilder.tsx'), 'registry copy');
  const page = readFileSync('site/components/FilterBuilder.html', 'utf8');
  assert.ok(page.includes('<h1>FilterBuilder</h1>'));
  assert.match(page, /data-props/);
});
