// Pins the editorial-frame primitives' truth rules, matching their CieoUI twins.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pageBounds } from '../dist/primitives/ReferenceText/ReferenceText.js';
import { stepState } from '../dist/primitives/StepList/StepList.js';
import { shareFractions } from '../dist/primitives/ShareBar/ShareBar.js';
import { rankLabel, barFraction } from '../dist/primitives/IndexRow/IndexRow.js';
import { rollColumns } from '../dist/primitives/RollCall/RollCall.js';

test('a page count never shows page 0 or a page past the total', () => {
  assert.deepEqual(pageBounds(4, 18), [4, 18]);
  assert.deepEqual(pageBounds(0, 18), [1, 18]);
  assert.deepEqual(pageBounds(25, 18), [18, 18]);
  assert.deepEqual(pageBounds(3, 0), [1, 1]);
  assert.deepEqual(pageBounds(Number.NaN, 5), [1, 5]);
});

test('step states follow the current step and clamp a stale index', () => {
  assert.equal(stepState(0, 1, 4), 'done');
  assert.equal(stepState(1, 1, 4), 'current');
  assert.equal(stepState(3, 1, 4), 'upcoming');
  assert.equal(stepState(3, 9, 4), 'current');
  assert.equal(stepState(0, -2, 4), 'current');
});

test('a share bar draws nothing unless every share is real', () => {
  assert.deepEqual(shareFractions([73, 25]).map((f) => Math.round(f * 100)), [74, 26]);
  assert.equal(shareFractions([73, 0]), null);
  assert.equal(shareFractions([73, Number.NaN]), null);
  assert.equal(shareFractions([-1, 3]), null);
  assert.equal(shareFractions([100]), null);
});

test('ranks are two digits and bars clamp to the row', () => {
  assert.equal(rankLabel(1), '01');
  assert.equal(rankLabel(12), '12');
  assert.equal(rankLabel(0), '01');
  assert.equal(barFraction(1.4), 1);
  assert.equal(barFraction(-1), 0);
  assert.equal(barFraction(Number.NaN), null);
  assert.equal(barFraction(undefined), null);
});

test('roll-call columns stay between one and four', () => {
  assert.equal(rollColumns(3), 3);
  assert.equal(rollColumns(0), 1);
  assert.equal(rollColumns(9), 4);
  assert.equal(rollColumns(Number.NaN), 3);
});

// Rendered output: what a screen reader and a stylesheet actually receive.
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { ReferenceText } from '../dist/primitives/ReferenceText/ReferenceText.js';
import { StepList } from '../dist/primitives/StepList/StepList.js';
import { IndexRow } from '../dist/primitives/IndexRow/IndexRow.js';
import { Portrait, cssUrl } from '../dist/primitives/Portrait/Portrait.js';

test('a spoken page count is hidden text beside the visible one, not an aria-label on a span', () => {
  const html = render(h(ReferenceText, { spoken: 'Page 4 of 18' }, '4/18'));
  assert.ok(!html.includes('aria-label'));
  assert.match(html, /aria-hidden="true">4\/18</);
  assert.match(html, /cieo-sr-only">Page 4 of 18</);
});

test('step lists say which step each is, and which are done', () => {
  const html = render(h(StepList, { steps: [{ title: 'Draft' }, { title: 'Vote', detail: 'Friday' }, { title: 'Sign' }], current: 1 }));
  assert.match(html, /Step 1 of 3, <\/span>Draft/);
  assert.equal((html.match(/, done</g) || []).length, 1);
  assert.match(html, /aria-current="step"/);
  assert.match(html, /Friday/);
});

test('an index row exposes its rank and its bar value to assistive tech', () => {
  const html = render(h(IndexRow, { rank: 3, title: 'Water', fraction: 0.42 }));
  assert.match(html, /cieo-sr-only">3\. </);
  assert.match(html, /role="meter"[^>]*aria-valuenow="42"/);
});

test('a portrait url survives quotes, parentheses and line breaks', () => {
  assert.equal(cssUrl('a"b)c\nd\\e.png'), 'url("a%22b%29c%0Ad%5Ce.png")');
  assert.match(render(h(Portrait, { src: 'x"y.png' })), /background-image:url\(&quot;x%22y\.png&quot;\)/);
});

test('block-ground frames never read their own inverted text color as their background', () => {
  const css = readFileSync(new URL('../design/styles/primitives/content-frame.css', import.meta.url), 'utf8');
  const rule = css.split('\n').find((l) => l.includes('[data-ground="block"] {'));
  assert.ok(rule && rule.includes('background: var(--cieo-block, var(--cieo-color-text))'));
  assert.ok(!rule.includes('--cieo-color-text:'), 'the frame itself must not redefine the token its background falls back to');
  assert.match(css, /\[data-ground="block"\] > \* \{ --cieo-color-text: var\(--cieo-on-block/);
});

test('roll-call groups stay whole across columns', () => {
  const css = readFileSync(new URL('../design/styles/primitives/roll-call.css', import.meta.url), 'utf8');
  assert.match(css, /> section \{ break-inside: avoid; \}/);
});
