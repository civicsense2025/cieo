// test/primitives-keyboard-state.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { roveFocus, enabledIn } from '../dist/react/index.js';
import { TabList } from '../dist/primitives/TabList/TabList.js';
import { Tab } from '../dist/primitives/Tab/Tab.js';
import { ToggleButton } from '../dist/primitives/ToggleButton/ToggleButton.js';
import { TableHeaderCell } from '../dist/primitives/TableHeaderCell/TableHeaderCell.js';
import { AuthMfaChallenge } from '../dist/primitives/AuthMfaChallenge/AuthMfaChallenge.js';
import { AuthEmailField } from '../dist/primitives/AuthEmailField/AuthEmailField.js';

function fakeItems(n, disabledAt = -1) {
  const log = [];
  const items = Array.from({ length: n }, (_, i) => ({
    i,
    hasAttribute: (a) => a === 'disabled' && i === disabledAt,
    getAttribute: () => null,
    contains: (x) => x === items[i],
    focus() { globalThis.document.activeElement = items[i]; log.push(`focus${i}`); },
    click() { log.push(`click${i}`); },
  }));
  return { items, log, container: { querySelectorAll: () => items } };
}
const key = (k) => ({ key: k, prevented: false, preventDefault() { this.prevented = true; } });

test('roveFocus moves focus and activates (tabs follow focus), skipping disabled items', () => {
  globalThis.document = { activeElement: null };
  const { items, log, container } = fakeItems(4, 1);
  items[0].focus(); log.length = 0;
  const e = key('ArrowRight');
  assert.equal(roveFocus(e, container, '[role=tab]', { orientation: 'horizontal', activate: true }), true);
  assert.equal(e.prevented, true);
  assert.deepEqual(log, ['focus2', 'click2']);
  const back = key('ArrowLeft');
  roveFocus(back, container, '[role=tab]', { orientation: 'horizontal' });
  assert.equal(globalThis.document.activeElement, items[0]);
  const other = key('a');
  assert.equal(roveFocus(other, container, '[role=tab]'), false);
  assert.equal(other.prevented, false);
  assert.equal(enabledIn(container, 'x').length, 3);
  delete globalThis.document;
});

test('TabList: one tab stop (selected), the others reachable by arrows', () => {
  const html = renderToStaticMarkup(h(TabList, { label: 'T', value: 'b' }, h(Tab, { value: 'a' }, 'A'), h(Tab, { value: 'b' }, 'B')));
  assert.equal([...html.matchAll(/tabindex="0"/g)].length, 1);
  assert.equal([...html.matchAll(/tabindex="-1"/g)].length, 1);
  const none = renderToStaticMarkup(h(TabList, { label: 'T' }, h(Tab, { value: 'a' }, 'A'), h(Tab, { value: 'b' }, 'B')));
  assert.equal([...none.matchAll(/tabindex="0"/g)].length, 2, 'with no selection every tab stays reachable');
  assert.match(readFileSync('src/primitives/TabList/TabList.tsx', 'utf8'), /roveFocus/);
  assert.match(readFileSync('src/primitives/TabMenu/TabMenu.tsx', 'utf8'), /roveFocus/);
});

test('ToggleButton works uncontrolled and still obeys controlled pressed', () => {
  assert.match(renderToStaticMarkup(h(ToggleButton, { label: 'B', defaultPressed: true }, 'b')), /aria-pressed="true"/);
  assert.match(renderToStaticMarkup(h(ToggleButton, { label: 'B', pressed: false, defaultPressed: true }, 'b')), /aria-pressed="false"/);
  const s = readFileSync('src/primitives/ToggleButton/ToggleButton.tsx', 'utf8');
  assert.match(s, /if \(pressed === undefined\) setInternal\(!own\)/);
});

test('a sortable header is a button even before it is sorted, and says aria-sort none', () => {
  const html = renderToStaticMarkup(h('table', null, h('thead', null, h('tr', null, h(TableHeaderCell, { onSort() {} }, 'Name')))));
  assert.match(html, /<button[^>]*aria-label="Sort by Name"/);
  assert.match(html, /aria-sort="none"/);
  assert.doesNotMatch(renderToStaticMarkup(h('table', null, h('thead', null, h('tr', null, h(TableHeaderCell, null, 'Plain'))))), /<button/);
});

test('AuthMfaChallenge announces an error once', () => {
  const html = renderToStaticMarkup(h(AuthMfaChallenge, { id: 'm', error: 'Bad code', onSubmit() {}, onRecovery() {} }));
  assert.equal([...html.matchAll(/role="alert"/g)].length, 1);
});

test('controlled AuthEmailField does not also pass defaultValue', () => {
  assert.match(readFileSync('src/primitives/AuthEmailField/AuthEmailField.tsx', 'utf8'), /defaultValue=\{value === undefined \? defaultValue : undefined\}/);
  assert.match(renderToStaticMarkup(h(AuthEmailField, { id: 'e', value: 'a@b.c', defaultValue: 'x' })), /value="a@b.c"/);
});
