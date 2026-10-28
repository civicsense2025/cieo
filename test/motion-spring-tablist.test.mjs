import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Track, setMotionState } from '../dist/core/spring.js';

test('indicator tracks selection through context registration', () => {
  const src = readFileSync('src/primitives/TabList/TabList.tsx', 'utf8');
  assert.match(src, /useEdges\(indicatorRef, `\$\{current/);
  assert.match(src, /registerTab/);
  assert.match(src, /style\.left.*style\.width/);
  assert.match(src, /new ResizeObserver/);
  const tab = readFileSync('src/primitives/Tab/Tab.tsx', 'utf8');
  assert.match(tab, /registerTab\(value, el\)/);
});

test('retarget mid-flight continues without jumping', () => {
  const tr = new Track(0);
  tr.set(100, { w: 22 }, 0);
  const mid = tr.at(0.05);
  tr.set(40, { w: 22 }, 0.05);
  assert.ok(Math.abs(tr.at(0.05) - mid) < 1e-9);
  assert.equal(Math.round(tr.at(1000)), 40);
});

test('disallowed motion resolves end state', () => {
  setMotionState(() => ({ reduced: true }));
  const tr = new Track(0);
  tr.jump(100);
  assert.equal(tr.at(999), 100);
  setMotionState(null);
});
