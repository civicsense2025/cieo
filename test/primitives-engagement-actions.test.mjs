import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { CountButton, countButtonLabel, COUNT_BUTTON_DIP } from '../dist/primitives/CountButton/CountButton.js';
import { ActionBar, actionBarIndex } from '../dist/primitives/ActionBar/ActionBar.js';
import { FollowButton, followLabel } from '../dist/primitives/FollowButton/FollowButton.js';
import { NotifyToggle, bellWiggleAngle, bellWiggleFrames, BELL_WIGGLE_MS, BELL_WIGGLE_DEGREES } from '../dist/primitives/NotifyToggle/NotifyToggle.js';
import { ShareButton, shareMethod, isShareableUrl, runShare } from '../dist/primitives/ShareButton/ShareButton.js';
import { Rating, ratingKeyStep, ratingLabel, ratingPopDelays } from '../dist/primitives/Rating/Rating.js';

const has = (html, re) => assert.match(html, re);

// CountButton
test('countButtonLabel joins label and exact count', () => {
  assert.equal(countButtonLabel('Like', 164, 'likes'), 'Like, 164 likes');
  assert.equal(countButtonLabel('Like', 26300, 'likes'), 'Like, 26,300 likes');
  assert.equal(countButtonLabel('Reply', 2), 'Reply, 2');
});
test('countButtonLabel is just the label for zero, missing and invalid counts', () => {
  for (const c of [0, undefined, NaN, -3, Infinity, 0.4]) assert.equal(countButtonLabel('Like', c, 'likes'), 'Like');
});
test('CountButton toggle exposes aria-pressed and the combined name', () => {
  const on = render(h(CountButton, { icon: 'o', activeIcon: 'x', label: 'Like', count: 164, countUnit: 'likes', pressed: true }));
  has(on, /<button(?=[^>]*type="button")(?=[^>]*aria-pressed="true")(?=[^>]*aria-label="Like, 164 likes")(?=[^>]*data-pressed)/);
  const off = render(h(CountButton, { icon: 'o', label: 'Like', pressed: false }));
  has(off, /aria-pressed="false"/);
  assert.doesNotMatch(off, /data-pressed/);
});
test('CountButton without pressed is a plain action with no aria-pressed', () => {
  const html = render(h(CountButton, { icon: 'o', label: 'Reply', count: 2 }));
  assert.doesNotMatch(html, /aria-pressed/);
  has(html, /aria-label="Reply, 2"/);
});
test('CountButton shows the compact count, hides it for zero, and keeps tone/size hooks', () => {
  const html = render(h(CountButton, { icon: 'o', label: 'Like', count: 1640, tone: 'danger', size: 'sm' }));
  has(html, />1\.6K</);
  has(html, /data-tone="danger"/);
  has(html, /data-size="sm"/);
  has(render(h(CountButton, { icon: 'o', label: 'Like', count: 0 })), /data-empty=""/);
  assert.doesNotMatch(render(h(CountButton, { icon: 'o', label: 'Like' })), /cieo-count-button-count/);
});
test('CountButton layers the active icon only when given, and can be disabled', () => {
  const html = render(h(CountButton, { icon: 'o', activeIcon: 'x', label: 'Like', pressed: true, disabled: true }));
  has(html, /data-glyph="base"/);
  has(html, /data-glyph="active"/);
  has(html, /data-has-active-icon/);
  has(html, /disabled/);
  assert.doesNotMatch(render(h(CountButton, { icon: 'o', label: 'Like' })), /data-glyph="active"/);
});
test('icon dips to 80%', () => assert.equal(COUNT_BUTTON_DIP, 0.8));

// ActionBar
test('actionBarIndex: arrows wrap, Home/End jump, other keys ignored', () => {
  assert.equal(actionBarIndex('ArrowRight', 0, 4), 1);
  assert.equal(actionBarIndex('ArrowRight', 3, 4), 0);
  assert.equal(actionBarIndex('ArrowLeft', 0, 4), 3);
  assert.equal(actionBarIndex('Home', 2, 4), 0);
  assert.equal(actionBarIndex('End', 0, 4), 3);
  assert.equal(actionBarIndex('ArrowDown', 1, 4), null);
  assert.equal(actionBarIndex('a', 1, 4), null);
  assert.equal(actionBarIndex('ArrowRight', 0, 0), null);
});
test('ActionBar renders a labelled toolbar with its children and layout hooks', () => {
  const html = render(h(ActionBar, { label: 'Post actions', size: 'sm', align: 'between' }, h('button', null, 'a'), h('button', null, 'b')));
  has(html, /role="toolbar"(?=[^>]*aria-label="Post actions")(?=[^>]*data-size="sm")(?=[^>]*data-align="between")/);
  has(html, /<button>a<\/button><button>b<\/button>/);
});

// FollowButton
test('followLabel covers every state', () => {
  assert.equal(followLabel(false, false), 'Follow');
  assert.equal(followLabel(false, true), 'Follow');
  assert.equal(followLabel(true, false), 'Following');
  assert.equal(followLabel(true, true), 'Unfollow');
});
test('FollowButton: the name matches the visible text, with and without a person, and no pressed state', () => {
  const off = render(h(FollowButton, { following: false, onToggle() {}, name: 'Ava' }));
  has(off, /aria-label="Follow Ava"/);
  assert.doesNotMatch(off, /aria-pressed/);
  const on = render(h(FollowButton, { following: true, onToggle() {}, name: 'Ava' }));
  has(on, /(?=[^>]*aria-label="Following Ava")(?=[^>]*data-following)/);
  has(render(h(FollowButton, { following: false, onToggle() {} })), /aria-label="Follow"/);
  assert.doesNotMatch(on, /data-previewing/);
});

// NotifyToggle
test('bell wiggle is a small damped swing that is done within 440ms and starts and ends at rest', () => {
  assert.ok(BELL_WIGGLE_MS <= 440);
  assert.equal(bellWiggleAngle(0), 0);
  assert.ok(Math.abs(bellWiggleAngle(1)) < 0.01);
  const frames = bellWiggleFrames();
  assert.equal(frames[0], 0);
  assert.equal(frames.at(-1), 0);
  assert.ok(Math.max(...frames.map(Math.abs)) <= BELL_WIGGLE_DEGREES);
  assert.ok(BELL_WIGGLE_DEGREES <= 15);
  const peaks = [];
  for (let i = 1; i < 100; i++) peaks.push(Math.abs(bellWiggleAngle(i / 100)));
  assert.ok(Math.max(...peaks.slice(0, 30)) > Math.max(...peaks.slice(60)), 'amplitude decays');
});
test('bellWiggleAngle clamps and survives NaN', () => {
  assert.equal(bellWiggleAngle(-1), 0);
  assert.equal(bellWiggleAngle(NaN), 0);
  assert.ok(Math.abs(bellWiggleAngle(5) - bellWiggleAngle(1)) < 1e-9);
  assert.equal(bellWiggleFrames(1).length, 3);
});
test('NotifyToggle exposes state, default label, and a check badge', () => {
  const off = render(h(NotifyToggle, { on: false, onToggle() {} }));
  has(off, /(?=[^>]*aria-pressed="false")(?=[^>]*aria-label="Notify me about new replies")/);
  assert.doesNotMatch(off, /data-on/);
  const on = render(h(NotifyToggle, { on: true, onToggle() {}, label: 'Notify me', size: 'sm' }));
  has(on, /(?=[^>]*aria-pressed="true")(?=[^>]*aria-label="Notify me")(?=[^>]*data-on)(?=[^>]*data-size="sm")/);
  has(on, /cieo-notify-toggle-badge/);
});

// ShareButton
test('shareMethod prefers native, then clipboard, then none', () => {
  assert.equal(shareMethod({ share() {}, clipboard: { writeText() {} } }), 'native');
  assert.equal(shareMethod({ clipboard: { writeText() {} } }), 'copy');
  assert.equal(shareMethod({ share: 'nope', clipboard: {} }), 'none');
  assert.equal(shareMethod({}), 'none');
  assert.equal(shareMethod(undefined), 'none');
});
test('only http and https URLs are shareable', () => {
  assert.equal(isShareableUrl('https://example.com/p/1'), true);
  assert.equal(isShareableUrl('http://example.com'), true);
  for (const u of ['javascript:alert(1)', 'data:text/html,hi', 'ftp://x.com', '/relative', '', 'not a url']) assert.equal(isShareableUrl(u), false);
});
test('ShareButton rejects credential-bearing destinations before invoking the share provider', async () => {
  const url = 'https://trusted.example@login.evil.test/reset';
  assert.equal(isShareableUrl(url), false);
  let calls = 0;
  const outcome = await runShare({ share: async () => { calls += 1; } }, { url });
  assert.equal(outcome, 'unavailable');
  assert.equal(calls, 0);
  has(render(h(ShareButton, { url })), /<button[^>]*disabled/);
});
test('runShare: native, copy, user cancel, native failure fallback, and failures', async () => {
  const url = 'https://example.com/p/1';
  let shared;
  assert.equal(await runShare({ share: async (d) => { shared = d; } }, { url, title: 'T' }), 'native');
  assert.deepEqual(shared, { url, title: 'T' });
  let copied;
  assert.equal(await runShare({ clipboard: { writeText: async (s) => { copied = s; } } }, { url }), 'copy');
  assert.equal(copied, url);
  const abort = Object.assign(new Error('x'), { name: 'AbortError' });
  assert.equal(await runShare({ share: async () => { throw abort; }, clipboard: { writeText: async () => { throw new Error('must not copy'); } } }, { url }), 'cancelled');
  assert.equal(await runShare({ share: async () => { throw new Error('boom'); }, clipboard: { writeText: async (s) => { copied = 'fallback:' + s; } } }, { url }), 'copy');
  assert.equal(copied, 'fallback:' + url);
  assert.equal(await runShare({ share: async () => { throw new Error('boom'); } }, { url }), 'failed');
  assert.equal(await runShare({ clipboard: { writeText: async () => { throw new Error('denied'); } } }, { url }), 'failed');
  assert.equal(await runShare({}, { url }), 'unavailable');
  assert.equal(await runShare({ share: async () => { throw new Error('must not run'); } }, { url: 'javascript:alert(1)' }), 'unavailable');
});
test('ShareButton markup: label, polite live region, disabled for unsafe URLs', () => {
  const ok = render(h(ShareButton, { url: 'https://example.com' }));
  has(ok, /Share/);
  has(ok, /role="status"(?=[^>]*aria-live="polite")/);
  assert.doesNotMatch(ok, /<button[^>]*disabled/);
  has(render(h(ShareButton, { url: 'javascript:alert(1)' })), /<button[^>]*disabled/);
  has(render(h(ShareButton, { url: 'https://example.com', label: 'Send' })), /Send/);
});

// Rating
test('ratingKeyStep moves, clamps and ignores', () => {
  assert.equal(ratingKeyStep('ArrowRight', 3, 5), 4);
  assert.equal(ratingKeyStep('ArrowUp', 0, 5), 1);
  assert.equal(ratingKeyStep('ArrowLeft', 3, 5), 2);
  assert.equal(ratingKeyStep('ArrowDown', 1, 5), null);
  assert.equal(ratingKeyStep('ArrowRight', 5, 5), null);
  assert.equal(ratingKeyStep('Home', 4, 5), 1);
  assert.equal(ratingKeyStep('End', 2, 5), 5);
  assert.equal(ratingKeyStep('End', 5, 5), null);
  assert.equal(ratingKeyStep('a', 2, 5), null);
  assert.equal(ratingKeyStep('ArrowRight', NaN, 5), 1);
  assert.equal(ratingKeyStep('ArrowRight', 99, 5), null);
  assert.equal(ratingKeyStep('End', 1, 0), null);
});
test('ratingLabel reads "4 out of 5" and clamps', () => {
  assert.equal(ratingLabel(4, 5), '4 out of 5');
  assert.equal(ratingLabel(3.5, 5), '3.5 out of 5');
  assert.equal(ratingLabel(9, 5), '5 out of 5');
  assert.equal(ratingLabel(-1, 5), '0 out of 5');
  assert.equal(ratingLabel(NaN, 5), '0 out of 5');
});
test('ratingPopDelays stagger fits in 150ms', () => {
  assert.deepEqual(ratingPopDelays(3, 3), []);
  assert.deepEqual(ratingPopDelays(4, 2), []);
  assert.deepEqual(ratingPopDelays(0, 1), [0]);
  const d = ratingPopDelays(0, 10);
  assert.equal(d.length, 10);
  assert.equal(d[0], 0);
  assert.ok(Math.max(...d) <= 150);
  assert.ok(d.every((v, i) => i === 0 || v >= d[i - 1]));
});
test('Rating and its helpers cap resource use at ten stars', () => {
  assert.equal(ratingKeyStep('End', 1, 1_000_000), 10);
  assert.equal(ratingLabel(99, 1_000_000), '10 out of 10');
  assert.equal(ratingPopDelays(0, 100_000).length, 10);
  assert.equal(ratingPopDelays(0, Infinity).length, 10);
  const interactive = render(h(Rating, { value: 0, label: 'Rate', max: 11 }));
  assert.equal((interactive.match(/role="radio"/g) ?? []).length, 10);
  const readOnly = render(h(Rating, { value: 9, label: 'Rating', max: 11, readOnly: true }));
  assert.match(readOnly, /aria-label="9 out of 10"/);
  assert.equal((readOnly.match(/data-star/g) ?? []).length, 10);
});
test('interactive Rating is a radiogroup with one tab stop and the right checked star', () => {
  const html = render(h(Rating, { value: 3, onChange() {}, label: 'Rate this reply' }));
  has(html, /role="radiogroup"(?=[^>]*aria-label="Rate this reply")/);
  assert.equal((html.match(/role="radio"/g) ?? []).length, 5);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  has(html, /role="radio"(?=[^>]*aria-checked="true")(?=[^>]*aria-label="3 stars")(?=[^>]*tabindex="0")/);
  has(html, /aria-label="1 star"/);
  assert.equal((html.match(/data-filled/g) ?? []).length, 3);
});
test('empty Rating still has a tab stop on the first star, and max is respected', () => {
  const html = render(h(Rating, { value: 0, label: 'Rate', max: 3 }));
  assert.equal((html.match(/role="radio"/g) ?? []).length, 3);
  has(html, /aria-label="1 star"(?=[^>]*tabindex="0")|tabindex="0"(?=[^>]*aria-label="1 star")/);
  assert.doesNotMatch(html, /aria-checked="true"/);
});
test('readOnly Rating is an image with the spoken summary and no radios', () => {
  const html = render(h(Rating, { value: 4, label: 'Rating', readOnly: true }));
  has(html, /role="img"(?=[^>]*aria-label="4 out of 5")/);
  assert.doesNotMatch(html, /role="radio"|tabindex/);
  assert.equal((html.match(/data-filled/g) ?? []).length, 4);
});
