import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { motionAttrs } from '../dist/primitives/motion.js';
import { Track, run, setMotionState } from '../dist/core/spring.js';

test('motionAttrs defaults to on with no keys', () => {
  assert.deepEqual(motionAttrs(), { 'data-motion': 'on' });
});
test('motionAttrs(false) kills everything with no behavior keys', () => {
  assert.deepEqual(motionAttrs({ motion: false }), { 'data-motion': 'off' });
});
test('motionAttrs passes entering/exiting through', () => {
  assert.deepEqual(motionAttrs({ entering: 'rise', exiting: 'fade' }),
    { 'data-motion': 'on', 'data-entering': 'rise', 'data-exiting': 'fade' });
});
test('kill-switch rule exists with fill-mode entering rules', () => {
  const css = readFileSync('design/styles/primitives/motion.css', 'utf8');
  assert.match(css, /\[data-motion='off'\]/);
  assert.match(css, /both/);
  assert.match(css, /prefers-reduced-motion/);
});
test('disallowed engine work finishes at end state', () => {
  setMotionState(() => ({ reduced: true }));
  let finished = false;
  run({ kind: 'feedback', step: () => true, finish: () => { finished = true; } });
  assert.equal(finished, true);
  setMotionState(null);
});
test('retargeted Track stays continuous', () => {
  const tr = new Track(0);
  tr.set(100, { w: 22 }, 0);
  const mid = tr.at(0.1);
  tr.set(200, { w: 22 }, 0.1);
  assert.ok(Math.abs(tr.at(0.1) - mid) < 1e-9);
  assert.equal(tr.at(1000), 200);
});
