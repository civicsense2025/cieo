// Regression: useFlip continuity across rapid retargets (round-2 fix).
// Drives the REAL dist/react/index.js useFlip with a stubbed React whose
// effect runner replicates React ordering (cleanup BEFORE setup) and stub DOM
// elements whose getBoundingClientRect reflects layout + live inline residual,
// like a real browser. jsdom-free and deterministic (fake clock).
//
// What failed before the fix: the keyed effect returned flip()'s cancel as its
// cleanup, so React cleared the residual translate before flipOffset() read it.
// A mid-flight retarget then restarted from the stale stored origin (a jump),
// or found no move at all and snapped. The fix keeps the previous job in a ref
// and cancels it explicitly AFTER the live reads in the next setup (unmount only).
import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { readFileSync } from 'node:fs';

register('./useflip-shim-loader.mjs', import.meta.url);

// Fake browser clock + viewport (document/window stay undefined).
globalThis.innerHeight = 900;
globalThis.innerWidth = 1400;
let T = 1000000;
try { performance.now = () => T; } catch { /* fall through; determinism test below guards */ }
let rafQ = [];
let rafId = 0;
globalThis.requestAnimationFrame = (cb) => { rafQ.push(cb); return ++rafId; };
globalThis.cancelAnimationFrame = (id) => { rafQ = rafQ.filter((_, i) => i !== id); };
function fireFrames(dtMs = 16, max = 5000) {
  let n = 0;
  while (rafQ.length && n < max) {
    T += dtMs;
    const q = rafQ; rafQ = [];
    for (const cb of q) cb();
    n += 1;
  }
  return { frames: n, drained: rafQ.length === 0 };
}

const { useFlip } = await import('../dist/react/index.js');
const R = await import('./useflip-react-stub.mjs');
const D = await import('./useflip-dom-stubs.mjs');

function mountFlip(container) {
  const ref = { current: container };
  let key = 'k1';
  const render = () => { D.setPhase('render'); useFlip(ref, key); D.setPhase('effect'); };
  const inst = R.mount(render);
  return { inst, retarget(next) { key = next; R.update(inst, render); } };
}

test('useFlip harness is deterministic (fake clock active)', () => {
  assert.equal(performance.now(), T, 'performance.now could not be stubbed — probe would be flaky');
});

test('round-1 settled origins still hold: first flip from 20, next from 50', () => {
  const A = D.makeKid('A', 20);
  const app = mountFlip(D.makeContainer([A]));
  assert.equal(A.style.transform, '', 'mount paints nothing');
  A.layout.left = 50; app.retarget('k2');
  assert.match(A.style.transform, /-30\.00px/, 'first flip dx');
  assert.equal(D.impliedOrigin(A).x, 20, 'first before origin');
  assert.ok(fireFrames().drained, 'flip settles');
  A.layout.left = 80; app.retarget('k3');
  assert.match(A.style.transform, /-30\.00px/, 'second flip dx');
  assert.equal(D.impliedOrigin(A).x, 50, 'second before origin');
});

test('mid-flight retarget restarts from the live on-screen origin', () => {
  const A = D.makeKid('A', 20);
  const app = mountFlip(D.makeContainer([A]));
  A.layout.left = 50; app.retarget('k2');
  assert.match(A.style.transform, /-30\.00px/, 'flip#1 in flight');
  const onScreen = A.layout.left + D.parseOffset(A.style.transform).x;
  assert.equal(onScreen, 20, 'pre-retarget on-screen position');
  app.inst.order.length = 0;
  app.retarget('k3'); // same layout: pure retarget mid-flight
  assert.deepEqual(app.inst.order, ['cleanup', 'setup'], 'React cleanup-before-setup ordering held');
  assert.match(A.style.transform, /-30\.00px/, 'retarget repaints the live residual instead of snapping');
  assert.equal(D.impliedOrigin(A).x, 20, 'before origin is the live position, not the stale stored one');
});

test('third retarget stores clean destinations (no residual pollution)', () => {
  const A = D.makeKid('A', 20);
  const app = mountFlip(D.makeContainer([A]));
  A.layout.left = 50; app.retarget('k2');
  fireFrames();
  A.layout.left = 80; app.retarget('k3');
  assert.match(A.style.transform, /-30\.00px/, 'flip#2 dx');
  fireFrames();
  A.layout.left = 110; app.retarget('k4');
  assert.match(A.style.transform, /-30\.00px/, 'flip#3 dx');
  assert.ok(!A.style.transform.includes('-60'), `polluted origin: ${A.style.transform}`);
  assert.equal(D.impliedOrigin(A).x, 80, 'third before origin is the clean destination');
});

test('new children stay out of before and arrive from opacity .45', () => {
  const A = D.makeKid('A', 20);
  const c = D.makeContainer([A]);
  const app = mountFlip(c);
  const Bkid = D.makeKid('B', 120);
  A.layout.left = 50; c.children = [A, Bkid]; app.retarget('k2');
  assert.match(A.style.transform, /-30\.00px/, 'mover slides from stored origin');
  assert.equal(Bkid.style.opacity, '0.450', 'new child fades in from ARRIVE, never from 0');
  assert.match(Bkid.style.transform, /0\.00px, 4\.00px/, 'new child arrives in place');
});

test('no render-phase reads; keyed effect never returns flip cancel', () => {
  assert.ok(D.phaseLog.length > 0, 'probe read geometry');
  assert.ok(!D.phaseLog.includes('render'), 'DOM read during render');
  const src = readFileSync(new URL('../src/react/index.tsx', import.meta.url), 'utf8');
  const useFlipSrc = src.slice(src.indexOf('export function useFlip'));
  assert.ok(!/return flip\(/.test(useFlipSrc), 'keyed effect returns flip() cancel as cleanup');
});
