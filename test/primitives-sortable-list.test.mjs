// test/primitives-sortable-list.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SortableList, sortableMove, sortableDropIndex, sortableAnnouncement, sortableStep, sortableKeyAction } from '../dist/primitives/SortableList/SortableList.js';
import { SortableListItem } from '../dist/primitives/SortableListItem/SortableListItem.js';

const ORDER = ['a', 'b', 'c', 'd'];

test('sortableMove moves, clamps and returns the same array when nothing changes', () => {
  assert.deepEqual(sortableMove(ORDER, 'a', 2), ['b', 'c', 'a', 'd']);
  assert.deepEqual(sortableMove(ORDER, 'd', 0), ['d', 'a', 'b', 'c']);
  assert.deepEqual(sortableMove(ORDER, 'b', 99), ['a', 'c', 'd', 'b']);
  assert.deepEqual(sortableMove(ORDER, 'b', -5), ['b', 'a', 'c', 'd']);
  assert.equal(sortableMove(ORDER, 'b', 1), ORDER);
  assert.equal(sortableMove(ORDER, 'zzz', 1), ORDER);
});

test('pointer reorder math: target index is the count of other midpoints the pointer passed', () => {
  const mids = [10, 30, 50];
  assert.equal(sortableDropIndex(mids, 0), 0);
  assert.equal(sortableDropIndex(mids, 10), 0);
  assert.equal(sortableDropIndex(mids, 11), 1);
  assert.equal(sortableDropIndex(mids, 40), 2);
  assert.equal(sortableDropIndex(mids, 500), 3);
  assert.equal(sortableDropIndex([], 5), 0);
});

test('pointer drag path: lift, cross two neighbours, drop commits the new order once', () => {
  let s = sortableStep(null, { type: 'lift', id: 'a', via: 'pointer' }, ORDER);
  assert.equal(s.event, 'lift');
  // dragged item 'a' leaves; the others (b, c, d) sit at midpoints 30, 50, 70. Pointer at 60 passes b and c.
  s = sortableStep(s.session, { type: 'moveTo', index: sortableDropIndex([30, 50, 70], 60) }, ORDER);
  assert.deepEqual(s.session.order, ['b', 'c', 'a', 'd']);
  assert.equal(s.commit, null, 'nothing is committed mid-drag');
  const again = sortableStep(s.session, { type: 'moveTo', index: 2 }, ORDER);
  assert.equal(again.event, null, 'staying in the same slot is a no-op');
  s = sortableStep(s.session, { type: 'drop' }, ORDER);
  assert.deepEqual(s.commit, ['b', 'c', 'a', 'd']);
  assert.equal(s.session, null);
});

test('dropping where it started commits nothing; unknown ids cannot be lifted', () => {
  let s = sortableStep(null, { type: 'lift', id: 'b', via: 'pointer' }, ORDER);
  s = sortableStep(s.session, { type: 'drop' }, ORDER);
  assert.equal(s.commit, null);
  assert.equal(sortableStep(null, { type: 'lift', id: 'nope', via: 'keyboard' }, ORDER).session, null);
  const lifted = sortableStep(null, { type: 'lift', id: 'a', via: 'keyboard' }, ORDER).session;
  assert.equal(sortableStep(lifted, { type: 'lift', id: 'b', via: 'keyboard' }, ORDER).session, lifted, 'a second lift is ignored');
});

test('keyboard path: Space lifts, arrows move, Space drops', () => {
  const run = (keys, id = 'b') => {
    let st = sortableStep(null, { type: 'lift', id, via: 'keyboard' }, ORDER);
    const events = [st.event];
    for (const k of keys) {
      const action = sortableKeyAction(k);
      assert.ok(action, `${k} maps to an action`);
      st = sortableStep(st.session, action, ORDER);
      events.push(st.event);
    }
    return { st, events };
  };
  const down = run(['ArrowDown', 'ArrowDown', ' ']);
  assert.deepEqual(down.events, ['lift', 'move', 'move', 'drop']);
  assert.deepEqual(down.st.commit, ['a', 'c', 'd', 'b']);
  assert.deepEqual(run(['ArrowUp', 'Enter']).st.commit, ['b', 'a', 'c', 'd']);
  assert.deepEqual(run(['End', ' ']).st.commit, ['a', 'c', 'd', 'b']);
  assert.deepEqual(run(['Home', ' ']).st.commit, ['b', 'a', 'c', 'd']);
  assert.deepEqual(run(['ArrowLeft', ' ']).st.commit, ['b', 'a', 'c', 'd'], 'horizontal keys work too');
  const edge = run(['ArrowUp', 'ArrowUp', ' '], 'a');
  assert.deepEqual(edge.events, ['lift', null, null, 'drop'], 'moving past the top is a silent no-op');
  assert.equal(edge.st.commit, null);
  assert.equal(sortableKeyAction('a'), null);
});

test('keyboard cancel restores the original order and never commits', () => {
  let st = sortableStep(null, { type: 'lift', id: 'a', via: 'keyboard' }, ORDER);
  st = sortableStep(st.session, sortableKeyAction('ArrowDown'), ORDER);
  assert.deepEqual(st.session.order, ['b', 'a', 'c', 'd']);
  st = sortableStep(st.session, sortableKeyAction('Escape'), ORDER);
  assert.equal(st.event, 'cancel');
  assert.equal(st.commit, null);
  assert.equal(st.session, null);
  assert.deepEqual(st.order, ORDER);
  assert.equal(sortableStep(null, { type: 'cancel' }, ORDER).event, null, 'cancel with nothing lifted does nothing');
});

test('announcements name the item and its 1-based position', () => {
  assert.match(sortableAnnouncement('lift', 'Draft', 2, 5), /Picked up Draft, position 2 of 5/);
  assert.equal(sortableAnnouncement('move', 'Draft', 3, 5), 'Draft moved to position 3 of 5.');
  assert.equal(sortableAnnouncement('drop', 'Draft', 3, 5), 'Draft dropped at position 3 of 5.');
  assert.match(sortableAnnouncement('cancel', 'Draft', 2, 5), /cancelled.*position 2 of 5/);
});

const item = (id, label) => h(SortableListItem, { key: id, id, label: label ?? id.toUpperCase() }, `row ${id}`);

test('renders items in `order` regardless of child order, with one labelled handle each', () => {
  const html = renderToStaticMarkup(h(SortableList, { label: 'Stages', order: ['c', 'a', 'b'], onReorder() {} }, item('a'), item('b'), item('c')));
  assert.match(html, /^<ul[^>]*aria-label="Stages"/);
  assert.deepEqual([...html.matchAll(/data-sortable-id="(\w)"/g)].map((m) => m[1]), ['c', 'a', 'b']);
  assert.equal([...html.matchAll(/aria-label="Reorder [A-C]"/g)].length, 3);
  assert.match(html, /<button type="button" data-sortable-handle="c"/);
});

test('works as table rows: tbody list renders tr rows with the handle in the first cell', () => {
  const rows = ['x', 'y'].map((id) => h(SortableListItem, { key: id, id, label: id }, h('td', null, `cell ${id}`)));
  const html = renderToStaticMarkup(h('table', null, h(SortableList, { as: 'tbody', label: 'Rows', order: ['y', 'x'], onReorder() {} }, ...rows)));
  assert.match(html, /<tbody[^>]*>\s*<tr[^>]*data-sortable-id="y"[^>]*><td class="cieo-sortable-list-handle-cell"><button/);
  assert.match(html, /<td>cell y<\/td>/);
  assert.doesNotMatch(html, /<li|<div class="cieo-sortable-list-body/);
});

test('ids missing from `order` still render, after the ordered ones', () => {
  const html = renderToStaticMarkup(h(SortableList, { label: 'L', order: ['b'], onReorder() {} }, item('a'), item('b')));
  assert.deepEqual([...html.matchAll(/data-sortable-id="(\w)"/g)].map((m) => m[1]), ['b', 'a']);
});

test('motion=false and orientation reach the DOM; disabled handle is disabled', () => {
  const html = renderToStaticMarkup(h(SortableList, { label: 'L', order: ['a'], onReorder() {}, motion: false, orientation: 'horizontal', as: 'div' }, h(SortableListItem, { id: 'a', disabled: true }, 'x')));
  assert.match(html, /data-motion="off"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /<button[^>]*disabled/);
  assert.match(html, /^<div/);
});

test('wiring: exports, css, docs pages and registry entries exist; reduced motion goes through useFlip', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const n of ['SortableList', 'SortableListItem']) {
    assert.ok(pkg.exports[`./${n}`], `${n} export`);
    assert.ok(existsSync(`site/components/${n}.html`), `${n} docs page`);
    assert.ok(existsSync(`registry/${n}/${n}.tsx`), `${n} registry copy`);
    assert.ok(existsSync(`src/primitives/${n}/manifest.json`) && existsSync(`src/primitives/${n}/README.md`));
  }
  assert.match(readFileSync('design/primitives.css', 'utf8'), /sortable-list\.css/);
  assert.ok(JSON.parse(readFileSync('registry/index.json', 'utf8')).components.SortableList);
  const src = readFileSync('src/primitives/SortableList/SortableList.tsx', 'utf8');
  assert.match(src, /useFlip\(ref/);
  assert.doesNotMatch(src, /from '(react-dom|@dnd-kit)/);
  assert.match(readFileSync('design/styles/primitives/sortable-list.css', 'utf8'), /touch-action: none/);
});
