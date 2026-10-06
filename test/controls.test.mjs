import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { listboxKey, Typeahead, step } from '../dist/controls/listbox.js';
import { nextFieldStatus, resolveFieldStatus } from '../dist/controls/field-state.js';
import { setNativeValue, submitOwner, indexOfValue, normalizeOptions } from '../dist/controls/native.js';
import { buttonClassName, Button, Select, TextField, TextArea, SearchField, Checkbox, Switch, RadioGroup, Radio, Range } from '../dist/controls/index.js';

const items = ['Newest', 'Oldest', 'Most viewed', 'Alphabetical', 'Nearby'].map((label) => ({ label }));
items[2] = { ...items[2], disabled: true };
const closed = { open: false, active: 0, selected: 1 };
const key = (state, k, opts = {}, ta = new Typeahead(), t = 0) => listboxKey(state, { key: k, ...opts }, items, ta, t);

test('listbox: closed keys open on the selected option (APG select-only combobox)', () => {
  assert.deepEqual(key(closed, 'ArrowDown').state, { open: true, active: 1, selected: 1 });
  assert.deepEqual(key(closed, 'Enter').state, { open: true, active: 1, selected: 1 });
  assert.deepEqual(key(closed, ' ').state, { open: true, active: 1, selected: 1 });
  assert.equal(key(closed, 'ArrowUp').state.active, 0, 'Up opens on the first option');
  assert.equal(key(closed, 'ArrowUp', { altKey: true }).state.active, 1);
  assert.equal(key(closed, 'Home').state.active, 0);
  assert.equal(key(closed, 'End').state.active, 4);
  const tab = key(closed, 'Tab');
  assert.equal(tab.handled, false, 'Tab is left to the browser');
  assert.equal(tab.state.open, false);
});

test('listbox: arrows skip disabled options and stop at the ends', () => {
  const open = { open: true, active: 1, selected: 1 };
  assert.equal(key(open, 'ArrowDown').state.active, 3, 'skips disabled index 2');
  assert.equal(key({ ...open, active: 3 }, 'ArrowUp').state.active, 1);
  assert.equal(key({ ...open, active: 4 }, 'ArrowDown').state.active, 4, 'no wrap at the end');
  assert.equal(key({ ...open, active: 0 }, 'ArrowUp').state.active, 0, 'no wrap at the start');
  assert.equal(key(open, 'PageDown').state.active, 4);
  assert.equal(key({ ...open, active: 4 }, 'PageUp').state.active, 0);
  assert.equal(step(items, 1, 1), 3);
});

test('listbox: Enter, Space, Tab and Alt+Up commit; Escape restores', () => {
  const open = { open: true, active: 3, selected: 1 };
  for (const [k, opts, handled] of [['Enter', {}, true], [' ', {}, true], ['Tab', {}, false], ['ArrowUp', { altKey: true }, true]]) {
    const r = key(open, k, opts);
    assert.equal(r.commit, 3, k);
    assert.equal(r.handled, handled, k);
    assert.deepEqual(r.state, { open: false, active: 3, selected: 3 }, k);
  }
  const esc = key(open, 'Escape');
  assert.equal(esc.commit, undefined);
  assert.deepEqual(esc.state, { open: false, active: 1, selected: 1 });
  assert.equal(key({ ...open, active: 2 }, 'Enter').commit, undefined, 'a disabled option never commits');
});

test('listbox: type-ahead builds a string, cycles on repeats and times out', () => {
  const ta = new Typeahead(500);
  const open = { open: true, active: 0, selected: 0 };
  let s = key(open, 'm', {}, ta, 0).state;
  assert.equal(s.active, 0, 'disabled "Most viewed" is skipped; no other m');
  s = key(open, 'n', {}, ta, 1000).state;
  assert.equal(s.active, 4, 'after the timeout a fresh "n" searches after the active option');
  s = key(s, 'n', {}, ta, 1100).state;
  assert.equal(s.active, 0, 'repeating "n" cycles to the next n-option');
  const ta2 = new Typeahead(500);
  const a = key(open, 'o', {}, ta2, 0).state;
  assert.equal(a.active, 1);
  const b = key(a, 'l', {}, ta2, 100).state;
  assert.equal(b.active, 1, '"ol" keeps Oldest');
  const ta3 = new Typeahead(500);
  key(open, 'n', {}, ta3, 0);
  const sp = key(open, ' ', {}, ta3, 50);
  assert.equal(sp.commit, undefined, 'space inside a type-ahead string does not commit');
  assert.equal(key(closed, 'a', {}, new Typeahead(), 0).state.active, 3, 'a printable key opens on the match');
});

test('field status: settles on blur, relaxes while typing, never scolds mid-word', () => {
  const r = (empty, valid, checks = true) => ({ empty, valid, checks });
  assert.equal(nextFieldStatus('neutral', 'input', r(false, false)), 'neutral', 'typing an incomplete value stays neutral');
  assert.equal(nextFieldStatus('neutral', 'blur', r(false, false)), 'invalid');
  assert.equal(nextFieldStatus('neutral', 'blur', r(false, true)), 'valid');
  assert.equal(nextFieldStatus('neutral', 'blur', r(false, true, false)), 'neutral', 'no rules, no success state');
  assert.equal(nextFieldStatus('neutral', 'blur', r(true, false)), 'neutral', 'tabbing through empty is fine');
  assert.equal(nextFieldStatus('invalid', 'input', r(false, true)), 'valid', 'fixed while typing turns valid at once');
  assert.equal(nextFieldStatus('valid', 'input', r(false, false)), 'neutral', 'breaking a valid value relaxes to neutral');
  assert.equal(nextFieldStatus('invalid', 'input', r(false, false)), 'invalid');
  assert.equal(nextFieldStatus('neutral', 'invalid', r(true, false)), 'invalid', 'a submit attempt marks it');
  assert.equal(nextFieldStatus('invalid', 'blur', r(true, false)), 'invalid', 'and leaving it empty keeps the mark');
  assert.equal(nextFieldStatus('invalid', 'reset', r(true, true)), 'neutral');
  assert.equal(resolveFieldStatus('valid', { error: 'Taken' }), 'invalid');
  assert.equal(resolveFieldStatus('valid', { error: '' }), 'valid');
  assert.equal(resolveFieldStatus('invalid', { status: 'neutral', error: 'x' }), 'neutral');
});

class FakeSelect extends EventTarget {
  value = 'a';
  form = null;
}

test('native sync: one input and one change event per real change, bubbling', () => {
  const el = new FakeSelect();
  const seen = [];
  el.addEventListener('input', (e) => seen.push(['input', e.bubbles, el.value]));
  el.addEventListener('change', (e) => seen.push(['change', e.bubbles, el.value]));
  assert.equal(setNativeValue(el, 'b'), true);
  assert.deepEqual(seen, [['input', true, 'b'], ['change', true, 'b']]);
  assert.equal(setNativeValue(el, 'b'), false, 'no event when unchanged');
  assert.equal(seen.length, 2);
});

test('native sync: submitOwner prefers requestSubmit and falls back to submit', () => {
  const calls = [];
  assert.equal(submitOwner({ form: null }), false);
  submitOwner({ form: { requestSubmit: () => calls.push('request'), submit: () => calls.push('submit') } });
  submitOwner({ form: { submit: () => calls.push('submit') } });
  assert.deepEqual(calls, ['request', 'submit']);
  const opts = normalizeOptions(['x', { value: 'y', label: 'Y', disabled: true }, 'z']);
  assert.equal(indexOfValue(opts, 'z'), 2);
  assert.equal(indexOfValue(opts, 'missing'), 0, 'unknown values fall back like a native select');
});

test('buttonClassName works without React and composes variants', () => {
  assert.equal(buttonClassName(), 'cieo-ctl cieo-btn cieo-btn--secondary cieo-btn--md');
  assert.equal(buttonClassName({ variant: 'primary', size: 'sm', iconOnly: true, className: 'x' }), 'cieo-ctl cieo-btn cieo-btn--primary cieo-btn--sm cieo-btn--icon x');
});

/* What a browser submits for a form, read from static markup: enabled, named controls only. */
function formPairs(html) {
  const pairs = [];
  const attr = (tag, a) => {
    const m = tag.match(new RegExp(`\\s${a}(?:="([^"]*)")?(?=[\\s>/])`));
    return m ? (m[1] ?? '') : null;
  };
  const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const re = /<(input|select|textarea)\b([^>]*)>([\s\S]*?<\/\1>)?/g;
  for (const m of html.matchAll(re)) {
    const [, tag, attrs, body = ''] = m;
    const open = `<${tag}${attrs}>`;
    const name = attr(open, 'name');
    if (name === null || attr(open, 'disabled') !== null) continue;
    if (tag === 'input') {
      const type = attr(open, 'type') ?? 'text';
      if ((type === 'checkbox' || type === 'radio') && attr(open, 'checked') === null) continue;
      pairs.push([name, decode(attr(open, 'value') ?? (type === 'checkbox' || type === 'radio' ? 'on' : ''))]);
    } else if (tag === 'select') {
      const opts = [...body.matchAll(/<option\b([^>]*)>/g)].map((o) => `<option${o[1]}>`);
      const chosen = opts.find((o) => attr(o, 'selected') !== null) ?? opts.find((o) => attr(o, 'disabled') === null);
      if (chosen) pairs.push([name, decode(attr(chosen, 'value') ?? '')]);
    } else {
      pairs.push([name, decode(body.replace(/<\/textarea>$/, '').replace(/^\n/, ''))]);
    }
  }
  return pairs;
}

test('no-JS: a form of controls renders to static HTML that submits the right name=value pairs', () => {
  const form = h(
    'form',
    { method: 'get', action: '/search' },
    h(SearchField, { name: 'q', label: 'Search bills', defaultValue: 'water' }),
    h(Select, { name: 'sort', label: 'Sort', options: [{ value: 'new', label: 'Newest' }, { value: 'old', label: 'Oldest' }], defaultValue: 'old', autoSubmit: true }),
    h(Select, { name: 'chamber', label: 'Chamber', options: ['House', 'Senate'] }),
    h(TextField, { name: 'email', type: 'email', label: 'Email', defaultValue: 'a@b.co', required: true }),
    h(TextArea, { name: 'note', label: 'Note', defaultValue: 'Hi & bye', showCount: true, maxLength: 200 }),
    h(Checkbox, { name: 'follow', label: 'Follow', defaultChecked: true }),
    h(Checkbox, { name: 'mute', label: 'Mute' }),
    h(Switch, { name: 'alerts', value: 'yes', label: 'Alerts', defaultChecked: true }),
    h(RadioGroup, { name: 'status', label: 'Status', defaultValue: 'passed' }, h(Radio, { value: 'introduced', label: 'Introduced' }), h(Radio, { value: 'passed', label: 'Passed' })),
    h(Range, { name: 'year', label: 'Year', min: 2000, max: 2026, defaultValue: 2020, showValue: true }),
    h(Button, { type: 'submit', variant: 'primary' }, 'Apply'),
  );
  const html = renderToString(form);
  assert.deepEqual(formPairs(html), [
    ['q', 'water'],
    ['sort', 'old'],
    ['chamber', 'House'],
    ['email', 'a@b.co'],
    ['note', 'Hi & bye'],
    ['follow', 'on'],
    ['alerts', 'yes'],
    ['status', 'passed'],
    ['year', '2020'],
  ]);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>Sort<\/label>/, 'the native select is labelled before hydration');
  assert.doesNotMatch(html, /role="combobox"|role="listbox"/, 'no inert combobox is shown before scripts run');
  assert.match(html, /<button[^>]*type="submit"/);
  assert.match(html, /--cieo-range-p:76\.923/, 'the range fill is drawn at the initial value');
});

test('server render: errors show without JS and wire aria-describedby', () => {
  const html = renderToString(h(TextField, { name: 'zip', label: 'ZIP', error: 'Enter five digits', defaultValue: '12' }));
  assert.match(html, /data-status="invalid"/);
  assert.match(html, /aria-invalid="true"/);
  const describedBy = html.match(/aria-describedby="([^"]+)"/)[1];
  assert.ok(html.includes(`id="${describedBy}"`), 'describedby points at the message');
  assert.match(html, /Enter five digits/);
  assert.match(html, /cieo-field-msg" data-open="true"/);
});

test('module boundaries: components are client modules, class helpers are not', async () => {
  const { readFile } = await import('node:fs/promises');
  const read = (f) => readFile(new URL(`../dist/controls/${f}`, import.meta.url), 'utf8');
  for (const f of ['Button.js', 'Select.js', 'Field.js', 'TextField.js', 'TextArea.js', 'SearchField.js', 'Toggles.js', 'Range.js']) {
    assert.match(await read(f), /^'use client';/, f);
  }
  for (const f of ['classes.js', 'index.js', 'listbox.js', 'native.js', 'field-state.js']) {
    assert.doesNotMatch(await read(f), /^['"]use client['"]/, f);
  }
  assert.match(await read('controls.css'), /prefers-reduced-motion/, 'the stylesheet ships in dist');
});
