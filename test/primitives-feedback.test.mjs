// test/primitives-feedback.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnnotationPin, annotationPinLabel, clampUnit } from '../dist/primitives/AnnotationPin/AnnotationPin.js';
import { FeedbackPopover, placePopover, isSubmitShortcut, commentText } from '../dist/primitives/FeedbackPopover/FeedbackPopover.js';
import { AnnotationLayer, normalizePoint, moveReticle, escapeAction, COMMENT_MODE_ON } from '../dist/primitives/AnnotationLayer/AnnotationLayer.js';
import { ActivityItem, activityMainTag } from '../dist/primitives/ActivityItem/ActivityItem.js';

const size = { width: 200, height: 100 };
const box = { width: 800, height: 600 };

test('annotationPinLabel names index, author and state; bad index becomes 1', () => {
  assert.equal(annotationPinLabel(3, 'open'), 'Comment 3, open');
  assert.equal(annotationPinLabel(3, 'resolved', 'Ava'), 'Comment 3 by Ava, resolved');
  assert.equal(annotationPinLabel(Number.NaN), 'Comment 1, open');
  assert.equal(annotationPinLabel(0, 'draft'), 'Comment 1, draft');
  assert.equal(annotationPinLabel(2.9), 'Comment 2, open');
});

test('clampUnit clamps to 0..1 and treats NaN as 0', () => {
  assert.equal(clampUnit(-1), 0);
  assert.equal(clampUnit(2), 1);
  assert.equal(clampUnit(0.4), 0.4);
  assert.equal(clampUnit(Number.NaN), 0);
});

test('AnnotationPin renders a named toggle button at percentage coordinates', () => {
  const html = renderToStaticMarkup(h(AnnotationPin, { index: 3, x: 0.25, y: 0.5, state: 'resolved', label: 'Ava', selected: true }));
  assert.match(html, /<button type="button"/);
  assert.match(html, /aria-label="Comment 3 by Ava, resolved"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-state="resolved"/);
  assert.match(html, /data-selected="true"/);
  assert.match(html, /left:25%/);
  assert.match(html, /top:50%/);
  assert.match(html, /aria-hidden="true"[^>]*class="cieo-annotation-pin-body"|class="cieo-annotation-pin-body"/);
  assert.match(renderToStaticMarkup(h(AnnotationPin, { index: 1, x: 2, y: -1 })), /left:100%[^"]*top:0%/);
  assert.match(renderToStaticMarkup(h(AnnotationPin, { index: 1, x: 0, y: 0, initials: 'AV' })), />AV</);
  assert.doesNotMatch(renderToStaticMarkup(h(AnnotationPin, { index: 1, x: 0, y: 0 })), /data-selected/);
});

test('placePopover prefers the right side', () => {
  const p = placePopover({ x: 100, y: 300 }, size, box);
  assert.equal(p.side, 'right');
  assert.equal(p.left, 108);
  assert.ok(p.top >= 0 && p.top + size.height <= box.height);
});

test('placePopover flips left, below and above when the preferred side overflows', () => {
  assert.equal(placePopover({ x: 700, y: 300 }, size, box).side, 'left');
  assert.equal(placePopover({ x: 700, y: 300 }, size, box).left, 700 - 8 - 200);
  const narrow = { width: 220, height: 600 };
  const below = placePopover({ x: 110, y: 100 }, size, narrow);
  assert.equal(below.side, 'below');
  assert.equal(below.top, 108);
  const above = placePopover({ x: 110, y: 560 }, size, narrow);
  assert.equal(above.side, 'above');
  assert.equal(above.top, 560 - 8 - 100);
});

test('placePopover always clamps inside the container, even when nothing fits', () => {
  const edge = placePopover({ x: 790, y: 590 }, size, box);
  assert.ok(edge.left >= 0 && edge.left + size.width <= box.width);
  assert.ok(edge.top >= 0 && edge.top + size.height <= box.height);
  const tiny = placePopover({ x: 10, y: 10 }, { width: 500, height: 500 }, { width: 100, height: 100 });
  assert.equal(tiny.left, 0);
  assert.equal(tiny.top, 0);
  const top = placePopover({ x: 100, y: 0 }, size, box);
  assert.equal(top.top, 0);
});

test('placePopover honours a custom gap', () => {
  assert.equal(placePopover({ x: 100, y: 300 }, size, box, 30).left, 130);
});

test('submit shortcut is Cmd or Ctrl plus Enter only; blank text never submits', () => {
  assert.equal(isSubmitShortcut({ key: 'Enter', metaKey: true }), true);
  assert.equal(isSubmitShortcut({ key: 'Enter', ctrlKey: true }), true);
  assert.equal(isSubmitShortcut({ key: 'Enter' }), false);
  assert.equal(isSubmitShortcut({ key: 'a', metaKey: true }), false);
  assert.equal(commentText('   \n'), null);
  assert.equal(commentText('  hi '), 'hi');
});

test('FeedbackPopover SSR: closed renders nothing; open is a non-modal dialog with disabled submit', () => {
  const noop = () => {};
  assert.equal(renderToStaticMarkup(h(FeedbackPopover, { open: false, onOpenChange: noop, onSubmit: noop })), '');
  const html = renderToStaticMarkup(h(FeedbackPopover, { open: true, onOpenChange: noop, onSubmit: noop, title: 'Thread', children: h('p', null, 'Earlier note'), secondaryActions: h('button', { type: 'button' }, 'Resolve') }));
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="false"/);
  assert.match(html, /aria-labelledby="([^"]+)"/);
  const id = html.match(/aria-labelledby="([^"]+)"/)[1];
  assert.match(html, new RegExp(`<h2 id="${id}"[^>]*>Thread</h2>`));
  assert.match(html, /placeholder="Add a comment"/);
  assert.match(html, /<button type="button" disabled=""[^>]*>Comment<\/button>/);
  assert.match(html, /Earlier note[\s\S]*<textarea/);
  assert.match(html, />Resolve</);
});

test('FeedbackPopover with anchor and container is absolutely placed and records its side', () => {
  const noop = () => {};
  const html = renderToStaticMarkup(h(FeedbackPopover, { open: true, onOpenChange: noop, onSubmit: noop, anchor: { x: 100, y: 200 }, container: box, submitLabel: 'Post', placeholder: 'Reply' }));
  assert.match(html, /data-placed="true"/);
  assert.match(html, /data-side="right"/);
  assert.match(html, /left:108px/);
  assert.match(html, />Post</);
  assert.match(html, /aria-label="Reply"/);
});

test('normalizePoint maps client coordinates to 0..1 and clamps', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };
  assert.deepEqual(normalizePoint(300, 150, rect), { x: 0.5, y: 0.5 });
  assert.deepEqual(normalizePoint(0, 0, rect), { x: 0, y: 0 });
  assert.deepEqual(normalizePoint(9999, 9999, rect), { x: 1, y: 1 });
  assert.deepEqual(normalizePoint(10, 10, { left: 0, top: 0, width: 0, height: 0 }), { x: 0, y: 0 });
  assert.deepEqual(normalizePoint(Number.NaN, 10, rect), { x: 0, y: 0 });
});

test('moveReticle steps small, big with Shift, clamps, and ignores other keys', () => {
  const c = { x: 0.5, y: 0.5 };
  assert.deepEqual(moveReticle(c, 'ArrowRight'), { x: 0.52, y: 0.5 });
  assert.deepEqual(moveReticle(c, 'ArrowLeft'), { x: 0.48, y: 0.5 });
  assert.deepEqual(moveReticle(c, 'ArrowUp'), { x: 0.5, y: 0.48 });
  assert.deepEqual(moveReticle(c, 'ArrowDown', true), { x: 0.5, y: 0.6 });
  assert.deepEqual(moveReticle({ x: 0.99, y: 0 }, 'ArrowRight', true), { x: 1, y: 0 });
  assert.deepEqual(moveReticle({ x: 0, y: 0.01 }, 'ArrowUp'), { x: 0, y: 0 });
  assert.equal(moveReticle(c, 'Enter'), null);
  assert.equal(moveReticle(c, 'a'), null);
});

test('Escape cancels an open draft or thread before leaving comment mode', () => {
  assert.equal(escapeAction(true), 'close-target');
  assert.equal(escapeAction(false), 'leave-mode');
});

const pins = [{ id: 'a', x: 0.1, y: 0.2 }, { id: 'b', x: 0.6, y: 0.7, state: 'resolved', initials: 'BO' }];
const layer = (props) => renderToStaticMarkup(h(AnnotationLayer, { label: 'Landing page', pins, active: false, onPlace() {}, onSelect() {}, renderPopover: () => null, ...props }, h('p', null, 'Hello')));

test('AnnotationLayer SSR: idle layer shows content and numbered pins in order, no overlay', () => {
  const html = layer({});
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Landing page"/);
  assert.match(html, /Hello/);
  assert.doesNotMatch(html, /cieo-annotation-layer-overlay/);
  assert.doesNotMatch(html, /data-active/);
  assert.ok(html.indexOf('aria-label="Comment 1, open"') < html.indexOf('aria-label="Comment 2, resolved"'));
  assert.match(html, /role="status"[^>]*aria-live="polite"/);
});

test('AnnotationLayer SSR: comment mode adds a focusable overlay and a draft pin numbered after existing pins', () => {
  const html = layer({ active: true, draft: { x: 0.3, y: 0.4 }, selectedId: 'b' });
  assert.match(html, /data-active="true"/);
  assert.match(html, /role="button"[^>]*tabindex="0"[^>]*aria-label="Place a comment on Landing page"|tabindex="0"[^>]*aria-label="Place a comment on Landing page"/);
  assert.match(html, /aria-label="Comment 3, draft"/);
  assert.match(html, /aria-label="Comment 2, resolved"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*aria-label="Comment 2, resolved"/);
});

test('comment-mode announcement text is the agreed sentence', () => {
  assert.equal(COMMENT_MODE_ON, 'Comment mode on. Click or press Enter to place a comment.');
});

test('activityMainTag picks link, button or plain row', () => {
  assert.equal(activityMainTag('/x', () => {}), 'a');
  assert.equal(activityMainTag(undefined, () => {}), 'button');
  assert.equal(activityMainTag(undefined, undefined), 'div');
});

const base = { actor: { name: 'Ava', avatar: h('span', null, 'AV') }, children: 'liked your reply' };

test('ActivityItem SSR: actor, action, quoted preview and time; unread is announced and styled', () => {
  const html = renderToStaticMarkup(h(ActivityItem, { ...base, preview: 'Great point', time: '2h', dateTime: '2026-10-23T10:00:00Z', unread: true, href: '/c/1', icon: h('svg') }));
  assert.match(html, /<a href="\/c\/1"[^>]*class="cieo-activity-item-main"/);
  assert.match(html, /<strong[^>]*>Ava<\/strong>/);
  assert.match(html, /liked your reply/);
  assert.match(html, /Great point/);
  assert.match(html, /<time dateTime="2026-10-23T10:00:00Z"|<time datetime="2026-10-23T10:00:00Z"/i);
  assert.match(html, /data-unread="true"/);
  assert.match(html, /cieo-sr-only">, unread</);
  assert.match(html, /class="cieo-activity-item-dot"/);
  assert.match(html, /aria-hidden="true" class="cieo-activity-item-badge"/);
});

test('ActivityItem SSR: read rows keep the dot element (so it can fade) but are not marked unread', () => {
  const html = renderToStaticMarkup(h(ActivityItem, { ...base, onSelect() {} }));
  assert.match(html, /<button type="button"[^>]*class="cieo-activity-item-main"/);
  assert.doesNotMatch(html, /data-unread/);
  assert.doesNotMatch(html, /, unread/);
  assert.match(html, /cieo-activity-item-dot/);
  assert.match(html, /data-tone="neutral"/);
});

test('ActivityItem SSR: informational row has no interactive element; actions stay outside the main action', () => {
  const plain = renderToStaticMarkup(h(ActivityItem, base));
  assert.doesNotMatch(plain, /<a |<button/);
  assert.doesNotMatch(plain, /data-interactive/);
  const html = renderToStaticMarkup(h(ActivityItem, { ...base, href: '/u/ava', tone: 'success', actions: h('button', { type: 'button' }, 'Follow back') }));
  assert.match(html, /data-tone="success"/);
  const mainEnd = html.indexOf('</a>');
  assert.ok(mainEnd > 0 && html.indexOf('Follow back') > mainEnd);
  assert.match(html, /class="cieo-activity-item-actions"/);
});
