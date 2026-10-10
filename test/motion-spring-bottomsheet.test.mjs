import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Track } from '../dist/core/spring.js';

test('sheet stays mounted through exit', () => {
  const src = readFileSync('src/primitives/BottomSheet/BottomSheet.tsx', 'utf8');
  assert.match(src, /const \{ mounted, ref \} = usePresence(<HTMLDivElement>)?\(open \?\? false, \{ disabled: motion === false/);
  assert.match(src, /if \(!mounted\) return null/);
  assert.match(src, /ref=\{ref\}/);
  assert.match(src, /data-side="bottom"/);
});

test('rapid toggle settles exactly once', () => {
  const tr = new Track(0);
  tr.set(1, { w: 22 }, 0);
  tr.set(0, { w: 34 }, 0.05);
  tr.set(1, { w: 22 }, 0.1);
  assert.equal(Math.round(tr.at(1000)), 1);
  assert.ok(tr.prune(1000) === 0);
});

test('entering choice selects presence origin', () => {
  const src = readFileSync('src/primitives/BottomSheet/BottomSheet.tsx', 'utf8');
  assert.match(src, /fade: \{[^}]*y: 0/s);
  assert.match(src, /entering === 'fade' \? ORIGINS\.fade/);
});
