// test/primitives-menu-behavior.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IconButton } from '../dist/primitives/IconButton/IconButton.js';
import { DropdownMenu } from '../dist/primitives/DropdownMenu/DropdownMenu.js';
import { DropdownMenuItem } from '../dist/primitives/DropdownMenuItem/DropdownMenuItem.js';
import { MoreMenu } from '../dist/primitives/MoreMenu/MoreMenu.js';
import { roveIndex, useDismiss } from '../dist/react/index.js';
import { readFileSync } from 'node:fs';

test('IconButton keeps native props, so a menu trigger can carry onClick and aria state', () => {
  const html = renderToStaticMarkup(h(IconButton, { label: 'More', id: 'x', 'aria-expanded': true, 'aria-haspopup': 'menu', onClick() {}, className: 'extra' }, '+'));
  assert.match(html, /id="x"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-label="More"/);
  assert.match(html, /class="cieo cieo-icon-button extra"/);
  assert.match(html, /type="button"/);
});

test('DropdownMenu trigger announces haspopup and expanded; panel is linked by id', () => {
  const closed = renderToStaticMarkup(h(DropdownMenu, { label: 'File', trigger: h('button', null, 'Open') }, h(DropdownMenuItem, { label: 'New' })));
  assert.match(closed, /aria-haspopup="menu"/);
  assert.match(closed, /aria-expanded="false"/);
  assert.doesNotMatch(closed, /role="menu"/);
  const open = renderToStaticMarkup(h(DropdownMenu, { label: 'File', open: true, trigger: h('button', null, 'Open') }, h(DropdownMenuItem, { label: 'New' })));
  assert.match(open, /aria-expanded="true"/);
  const id = open.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(id && open.includes(`id="${id}"`));
});

test('two DropdownMenus never share a panel id', () => {
  const html = renderToStaticMarkup(h('div', null, h(DropdownMenu, { label: 'A', open: true, trigger: h('button', null, 'a') }, h(DropdownMenuItem, { label: 'x' })), h(DropdownMenu, { label: 'B', open: true, trigger: h('button', null, 'b') }, h(DropdownMenuItem, { label: 'y' }))));
  const ids = [...html.matchAll(/role="menu"/g)].length;
  const idAttrs = [...html.matchAll(/<div id="([^"]+)" role="menu"/g)].map((m) => m[1]);
  assert.equal(ids, 2);
  assert.equal(new Set(idAttrs).size, 2);
});

test('MoreMenu renders a trigger that can open (props reach the button)', () => {
  const html = renderToStaticMarkup(h(MoreMenu, null, h(DropdownMenuItem, { label: 'Delete' })));
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-label="More actions"/);
});

test('roveIndex wraps vertically, honours Home/End and ignores other keys', () => {
  assert.equal(roveIndex('ArrowDown', 0, 3), 1);
  assert.equal(roveIndex('ArrowDown', 2, 3), 0);
  assert.equal(roveIndex('ArrowUp', 0, 3), 2);
  assert.equal(roveIndex('ArrowDown', 2, 3, { loop: false }), 2);
  assert.equal(roveIndex('ArrowDown', -1, 3), 0);
  assert.equal(roveIndex('ArrowUp', -1, 3), 2);
  assert.equal(roveIndex('Home', 2, 3), 0);
  assert.equal(roveIndex('End', 0, 3), 2);
  assert.equal(roveIndex('a', 0, 3), null);
  assert.equal(roveIndex('ArrowLeft', 1, 3), null);
  assert.equal(roveIndex('ArrowLeft', 1, 3, { orientation: 'horizontal' }), 0);
  assert.equal(roveIndex('ArrowDown', 0, 0), null);
});

test('uncontrolled menu closes on item select, Escape and outside press (source contract)', () => {
  const src = readFileSync('src/primitives/DropdownMenu/DropdownMenu.tsx', 'utf8');
  assert.match(src, /useDismiss\(isOpen/);
  assert.match(src, /if \(open === undefined\) setInternal\(next\)/);
  const item = readFileSync('src/primitives/DropdownMenuItem/DropdownMenuItem.tsx', 'utf8');
  assert.match(item, /menu\?\.close\(\)/);
  assert.equal(typeof useDismiss, 'function');
});
