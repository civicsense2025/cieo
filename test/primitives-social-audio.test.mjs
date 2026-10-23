// test/primitives-social-audio.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompactCount, formatCompactCount, formatExactCount } from '../dist/primitives/CompactCount/CompactCount.js';
import { AudioTime, formatAudioTime, speakAudioTime } from '../dist/primitives/AudioTime/AudioTime.js';

test('formatCompactCount shortens like a feed and clamps bad input to a whole count', () => {
  assert.equal(formatCompactCount(164), '164');
  assert.equal(formatCompactCount(1640), '1.6K');
  assert.equal(formatCompactCount(26300), '26.3K');
  assert.equal(formatCompactCount(4_000_000), '4M');
  assert.equal(formatCompactCount(-3), '0');
  assert.equal(formatCompactCount(Number.NaN), '0');
  assert.equal(formatCompactCount(2.9), '2');
  assert.equal(formatExactCount(26300), '26,300');
});

test('CompactCount shows the short form and speaks the exact one; zero hides by default', () => {
  const html = renderToStaticMarkup(h(CompactCount, { value: 26300, unit: 'views', motion: false }));
  assert.match(html, /<span aria-hidden="true">26\.3K<\/span>/);
  assert.match(html, /class="cieo-sr-only">26,300 views</);
  assert.match(html, /title="26,300 views"/);
  assert.match(renderToStaticMarkup(h(CompactCount, { value: 0 })), /data-empty=""/);
  assert.doesNotMatch(renderToStaticMarkup(h(CompactCount, { value: 0, hideZero: false })), /data-empty/);
});

test('formatAudioTime reads m:ss, then h:mm:ss, and never goes negative', () => {
  assert.equal(formatAudioTime(0), '0:00');
  assert.equal(formatAudioTime(63.9), '1:03');
  assert.equal(formatAudioTime(3600 + 5), '1:00:05');
  assert.equal(formatAudioTime(-4), '0:00');
  assert.equal(formatAudioTime(Number.POSITIVE_INFINITY), '0:00');
  assert.equal(speakAudioTime(63), '1 minute 3 seconds');
  assert.equal(speakAudioTime(0), '0 seconds');
  assert.equal(speakAudioTime(3660), '1 hour 1 minute');
});

test('AudioTime modes: elapsed of total, time left, length only, unknown length', () => {
  const r = (p) => renderToStaticMarkup(h(AudioTime, p));
  assert.match(r({ current: 12, duration: 63 }), />0:12 \/ 1:03</);
  assert.match(r({ current: 12, duration: 63 }), /12 seconds of 1 minute 3 seconds/);
  assert.match(r({ current: 12, duration: 63, mode: 'remaining' }), />-0:51</);
  assert.match(r({ current: 0, duration: 63, mode: 'total' }), />1:03</);
  assert.match(r({ current: 0, mode: 'total' }), />--:--</);
  assert.match(r({ current: 7 }), />0:07</);
});
