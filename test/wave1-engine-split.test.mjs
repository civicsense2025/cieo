import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { S, Track, resp, vel, settleTime, setMotionState } from '../dist/core/spring.js';
import { SpringChannel } from '../dist/live/spring-channel.js';
import { edges } from '../dist/dom/index.js';
import { SwapText } from '../dist/react/index.js';

function walkSrc(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkSrc(p, out);
    else if (/\.(ts|tsx|css)$/.test(e.name) && p !== 'src/primitives/index.ts') out.push(p);
  }
  return out;
}

test('every handwritten source file in src/ is strictly <= 300 lines', () => {
  const over = [];
  for (const file of walkSrc('src')) {
    const lines = readFileSync(file, 'utf8').split('\n');
    // Match wc -l / standard line count (exclude trailing empty split after final newline)
    const count = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
    if (count > 300) over.push(`${file} (${count}L)`);
  }
  assert.deepEqual(over, []);
});

test('src/core/scheduler.ts is extracted and re-exported from src/core/spring.ts', async () => {
  const scheduler = await import('../dist/core/scheduler.js');
  const spring = await import('../dist/core/spring.js');
  for (const name of ['setMotionState', 'reducedQuery', 'state', 'REDUCED_SUBTREE', 'subtreeReduced', 'onscreen', 'allowed', 'config', 'sync', 'run', 'active']) {
    assert.equal(typeof scheduler[name], typeof spring[name], `${name} exported from scheduler`);
    assert.equal(scheduler[name], spring[name], `${name} re-exported identically`);
  }
});

test('SpringConfig supports optional damping ratio z (0.7 <= z <= 1.0) and clamps to 1 under reduced motion', () => {
  const cfgCrit = { w: 22 };
  const cfgExplicitOne = { w: 22, z: 1 };
  assert.equal(resp(0.08, 1, 0, cfgCrit), resp(0.08, 1, 0, cfgExplicitOne));
  assert.equal(vel(0.08, 1, 0, cfgCrit), vel(0.08, 1, 0, cfgExplicitOne));
  assert.equal(settleTime(cfgCrit), settleTime(cfgExplicitOne));

  const under = { w: 22, z: 0.75 };
  assert.equal(resp(0, 2, -5, under), 2);
  assert.equal(vel(0, 2, -5, under), -5);

  // Numerical derivative of resp matches analytical vel
  const dt = 0.09, hDt = 1e-6;
  const numVel = (resp(dt + hDt, 1.5, -3, under) - resp(dt - hDt, 1.5, -3, under)) / (2 * hDt);
  assert.ok(Math.abs(vel(dt, 1.5, -3, under) - numVel) < 1e-5, `vel ${vel(dt, 1.5, -3, under)} vs numerical ${numVel}`);

  // Unit step with z = 0.75 overshoots (resp goes negative)
  let minOffset = 1;
  for (let i = 1; i <= 200; i += 1) minOffset = Math.min(minOffset, resp(i * 0.005, 1, 0, under));
  assert.ok(minOffset < -0.01, `expected underdamped overshoot (negative offset), got ${minOffset}`);

  // Clamping out-of-range z to [0.7, 1.0]
  assert.equal(resp(0.1, 1, 0, { w: 22, z: 0.3 }), resp(0.1, 1, 0, { w: 22, z: 0.7 }));
  assert.equal(resp(0.1, 1, 0, { w: 22, z: 2.0 }), resp(0.1, 1, 0, { w: 22, z: 1.0 }));

  // settleTime accounts for underdamped rebound (never stops at first zero crossing)
  const st = settleTime(under, 1e-3);
  assert.ok(st > settleTime(cfgCrit, 1e-3), `underdamped settleTime (${st}) must exceed critical (${settleTime(cfgCrit, 1e-3)})`);
  for (let extra = 0; extra <= 0.2; extra += 0.01) {
    assert.ok(Math.abs(resp(st + extra, 1, 0, under)) <= 1.01e-3, `still settled at st + ${extra}`);
  }

  // Reduced motion clamps z to 1.0
  setMotionState(() => ({ reduced: true }));
  try {
    assert.equal(resp(0.12, 1, 0, under), resp(0.12, 1, 0, cfgCrit));
    assert.equal(vel(0.12, 1, 0, under), vel(0.12, 1, 0, cfgCrit));
    assert.equal(settleTime(under), settleTime(cfgCrit));
  } finally {
    setMotionState(null);
  }

  // Track works with underdamped SpringConfig and prunes only after rebound settles
  const tr = new Track(0, under);
  tr.set(100, under, 0);
  let maxVal = 0;
  for (let i = 1; i <= 200; i += 1) maxVal = Math.max(maxVal, tr.at(i * 0.005));
  assert.ok(maxVal > 101, `Track overshoots target 100, max=${maxVal}`);
  assert.equal(Math.round(tr.at(10)), 100);
  assert.equal(tr.prune(10), 0);
});

test('SpringChannel supports optional zeta (0.7 <= zeta <= 1.0) with C1 continuity', () => {
  assert.throws(() => new SpringChannel(0, 0, { zeta: 0.69 }), RangeError);
  assert.throws(() => new SpringChannel(0, 0, { zeta: 1.01 }), RangeError);
  assert.throws(() => new SpringChannel(0, 0, { zeta: Number.NaN }), RangeError);

  const ch = new SpringChannel(0, 0, { w: 22, zeta: 0.75 });
  ch.retarget(1, 0);
  let peak = 0;
  for (let i = 1; i <= 240; i += 1) {
    const s = ch.sample(i / 240);
    peak = Math.max(peak, s.value);
  }
  assert.ok(peak > 1.01, `SpringChannel with zeta=0.75 overshoots 1, peak=${peak}`);

  // Interrupt mid-flight preserves value and velocity
  const ch2 = new SpringChannel(0, 0, { w: 22, zeta: 0.75 });
  ch2.retarget(100, 0);
  const before = ch2.sample(0.08);
  ch2.retarget(-20, 0.08, 34);
  const after = ch2.sample(0.08);
  assert.ok(Math.abs(before.value - after.value) <= 1e-9);
  assert.ok(Math.abs(before.velocity - after.velocity) <= 1e-9);
});

test('edges() supports axis y and axis both (2D leading-trailing edges)', () => {
  const savedRaf = globalThis.requestAnimationFrame;
  const savedCaf = globalThis.cancelAnimationFrame;
  const savedPerf = globalThis.performance;
  let nowMs = 0;
  const callbacks = new Map();
  let nextId = 1;
  globalThis.performance = { now: () => nowMs };
  globalThis.requestAnimationFrame = (cb) => { const id = nextId++; callbacks.set(id, cb); return id; };
  globalThis.cancelAnimationFrame = (id) => { callbacks.delete(id); };
  setMotionState(() => ({ reduced: false, hidden: false, paused: false }));

  const makeEl = (rect) => {
    const style = new Proxy({}, {
      get(t, k) {
        if (k === 'getPropertyValue') return (p) => t[p] ?? '';
        if (k === 'getPropertyPriority') return () => '';
        if (k === 'setProperty') return (p, v) => { t[p] = v; };
        if (k === 'removeProperty') return (p) => { delete t[p]; };
        return t[k] ?? '';
      },
      set(t, k, v) { t[k] = v; return true; },
    });
    const attrs = new Map();
    return {
      style,
      hasAttribute: (a) => attrs.has(a),
      getAttribute: (a) => attrs.get(a) ?? null,
      removeAttribute: (a) => attrs.delete(a),
      closest: () => null,
      getBoundingClientRect: () => rect,
    };
  };

  try {
    // Vertical axis: 'y'
    const elY = makeEl({ left: 10, right: 90, top: 100, bottom: 140, width: 80, height: 40 });
    const cancelY = edges(elY, { left: 10, right: 90, top: 20, bottom: 60 }, { left: 10, right: 90, top: 100, bottom: 140 }, { axis: 'y' });
    assert.equal(elY.style.transformOrigin, '50% 0');
    assert.match(elY.style.transform, /^translateY\(-80\.00px\) scaleY\(1\.0000\)$/);
    nowMs = 40;
    for (const cb of [...callbacks.values()]) { callbacks.clear(); cb(); }
    // Moving down: bottom (leading) moved past 60 while top (lagging, LAG=60ms) is still at 20 -> scaleY > 1!
    const mY = /scaleY\(([\d.]+)\)/.exec(elY.style.transform);
    assert.ok(mY && Number(mY[1]) > 1.05, `expected stretched vertical scaleY > 1.05 during LAG, got ${elY.style.transform}`);
    cancelY();

    // 2D axis: 'both'
    nowMs = 1000;
    const el2D = makeEl({ left: 120, right: 200, top: 100, bottom: 140, width: 80, height: 40 });
    const cancel2D = edges(el2D, { left: 20, right: 100, top: 20, bottom: 60 }, { left: 120, right: 200, top: 100, bottom: 140 }, { axis: 'both' });
    assert.equal(el2D.style.transformOrigin, '0 0');
    assert.match(el2D.style.transform, /^translate\(-100\.00px, -80\.00px\) scale\(1\.0000, 1\.0000\)$/);
    cancel2D();
  } finally {
    setMotionState(null);
    globalThis.requestAnimationFrame = savedRaf;
    globalThis.cancelAnimationFrame = savedCaf;
    globalThis.performance = savedPerf;
  }
});

test('SwapText never injects runtime <style data-cieo="swap"> and motion.css provides cieo-swap keyframes', () => {
  const reactFiles = readdirSync('src/react').filter((f) => /\.(ts|tsx)$/.test(f));
  for (const f of reactFiles) {
    const src = readFileSync(join('src/react', f), 'utf8');
    assert.doesNotMatch(src, /createElement\(['"]style['"]\)|data-cieo.*swap/, `src/react/${f} must not inject inline <style>`);
  }
  const html = renderToStaticMarkup(h(SwapText, { value: 'Ready' }));
  assert.match(html, /class="cieo-swap"/);
  const motionCss = readFileSync('design/styles/primitives/motion.css', 'utf8');
  assert.match(motionCss, /\.cieo-swap\b/);
  assert.match(motionCss, /@keyframes\s+cieo-swap-out\b/);
  assert.match(motionCss, /@keyframes\s+cieo-swap-in\b/);
});
