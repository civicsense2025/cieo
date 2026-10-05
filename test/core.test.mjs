import { test } from 'node:test';
import assert from 'node:assert/strict';
import { S, Track, resp, vel, prog, settleTime, allowed, run, setMotionState } from '../dist/core/spring.js';

test('critically damped: monotonic, never overshoots, settles', () => {
  for (const cfg of Object.values(S)) {
    let last = 1;
    for (let t = 0; t <= 2; t += 0.004) {
      const x = resp(t, 1, 0, cfg);
      assert.ok(x <= last + 1e-12 && x >= -1e-12, `w${cfg.w} at ${t}: ${x}`);
      last = x;
    }
    assert.ok(resp(settleTime(cfg), 1, 0, cfg) <= 1e-3 + 1e-9);
  }
});

test('velocity is the derivative of position', () => {
  const cfg = S.base, h = 1e-6;
  for (const t of [0.01, 0.05, 0.2]) {
    const num = (resp(t + h, 1, 2, cfg) - resp(t - h, 1, 2, cfg)) / (2 * h);
    assert.ok(Math.abs(num - vel(t, 1, 2, cfg)) < 1e-4);
  }
});

test('Track retargets as a sum and keeps position continuous', () => {
  const tr = new Track(0, S.base);
  tr.set(100, S.base, 0);
  const mid = tr.at(0.05);
  tr.set(0, S.base, 0.05);
  assert.ok(Math.abs(tr.at(0.05) - mid) < 1e-9, 'no jump on retarget');
  assert.ok(Math.abs(tr.at(5)) < 1e-6, 'settles at new target');
  assert.equal(tr.prune(5), 0);
});

test('release carries velocity', () => {
  const tr = new Track(0).release(0, 50, 10, S.snap, 0);
  assert.ok(tr.at(0.01) > 0.4, 'moves with initial velocity');
  assert.ok(Math.abs(tr.velocity(0) - 50) < 1e-9);
});

test('prog goes 0 to 1', () => {
  assert.equal(prog(0, 0), 0);
  assert.ok(prog(2, 0) > 0.999);
});

test('setMotionState gates kinds; run finishes at once when not allowed', () => {
  setMotionState(() => ({ reduced: true }));
  assert.equal(allowed('feedback'), false);
  let finished = false;
  run(() => true, { kind: 'feedback', finish: () => { finished = true; } });
  assert.equal(finished, true);
  setMotionState(() => ({ paused: true }));
  assert.equal(allowed('feedback'), true);
  assert.equal(allowed('ambient'), false);
  setMotionState(null);
});

test('run() without a kind obeys the gates (defaults to feedback)', () => {
  setMotionState(() => ({ reduced: true }));
  let finished = false;
  run({ step: () => true, finish: () => { finished = true; } });
  assert.equal(finished, true);
  setMotionState(null);
});

test('state() honours data-motion="full" over reduced-motion media', async () => {
  const prev = { document: globalThis.document, matchMedia: globalThis.matchMedia };
  const dataset = { motion: 'full' };
  let calls = 0;
  globalThis.document = { documentElement: { dataset }, hidden: false, addEventListener() {} };
  globalThis.matchMedia = () => { calls += 1; return { matches: true, addEventListener() {} }; };
  const mod = await import('../dist/core/spring.js?media');
  assert.equal(mod.state().reduced, false);
  dataset.motion = '';
  assert.equal(mod.state().reduced, true);
  mod.state(); mod.state();
  assert.equal(calls, 1, 'matchMedia list is cached');
  globalThis.document = prev.document;
  globalThis.matchMedia = prev.matchMedia;
  if (!prev.document) delete globalThis.document;
  if (!prev.matchMedia) delete globalThis.matchMedia;
});
