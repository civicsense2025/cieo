import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { setMotionState } from '../dist/core/spring.js';
import {
  rubberBand,
  projectMomentum,
  projectToDetent,
  PointerVelocityTracker,
  SpringVector2D,
  SpringRect,
} from '../dist/live/index.js';
import { useGestureSpring, useSharedAxis } from '../dist/react/index.js';

test('rubberBand asymptotically approaches dimension, preserves sign, and handles zero/edge inputs', () => {
  assert.equal(rubberBand(0, 200), 0);
  assert.equal(rubberBand(50, 0), 0);
  assert.equal(rubberBand(50, 200, 0), 0);

  const posSmall = rubberBand(10, 200, 0.55);
  const posLarge = rubberBand(500, 200, 0.55);
  const posHuge = rubberBand(1e6, 200, 0.55);
  assert.ok(posSmall > 0 && posSmall < 10, `small overshoot damped: ${posSmall}`);
  assert.ok(posLarge > posSmall && posLarge < 200, `monotonic < dimension: ${posLarge}`);
  assert.ok(posHuge < 200 && posHuge > 199, `asymptote approaches 200: ${posHuge}`);

  // Odd symmetry: rubberBand(-x) === -rubberBand(x)
  assert.equal(rubberBand(-120, 300, 0.55), -rubberBand(120, 300, 0.55));
});

test('projectMomentum projects inertial stopping position from initial velocity and decelerationRate', () => {
  assert.equal(projectMomentum(100, 0), 100);
  const up = projectMomentum(100, 1000, 0.998);
  // 0.998 / (1 - 0.998) = 499ms -> +499 units
  assert.ok(Math.abs(up - 599) < 1e-6, `expected 599, got ${up}`);
  const down = projectMomentum(100, -500, 0.998);
  assert.ok(Math.abs(down - -149.5) < 1e-6, `expected -149.5, got ${down}`);
});

test('projectToDetent snaps to nearest below threshold and projects/steps on flick across normalized and pixel detents', () => {
  const norm = [0.9, 0, 0.4]; // unsorted input must be sorted internally
  assert.equal(projectToDetent(0.15, 0, norm), 0);
  assert.equal(projectToDetent(0.25, 0, norm), 0.4);
  assert.equal(projectToDetent(0.38, 120, norm, 450), 0.4, 'sub-threshold velocity snaps to nearest');
  assert.equal(projectToDetent(0.4, -600, norm, 450), 0, 'downward flick from 0.4 dismisses to 0');
  assert.equal(projectToDetent(0.05, 550, norm, 450), 0.4, 'moderate upward flick from 0.05 lands on middle detent 0.4');
  assert.equal(projectToDetent(0.05, 1800, norm, 450), 0.9, 'fast upward fling from 0.05 reaches top detent 0.9');

  const pxDetents = [0, 300, 600];
  assert.equal(projectToDetent(120, 100, pxDetents, 450), 0);
  assert.equal(projectToDetent(120, 600, pxDetents, 450), 300);
  assert.equal(projectToDetent(120, 1300, pxDetents, 450), 600);
  assert.throws(() => projectToDetent(0, 0, []), RangeError);
});

test('PointerVelocityTracker computes px/s velocity, prunes stale samples on pause, and resets cleanly', () => {
  const tracker = new PointerVelocityTracker();
  assert.deepEqual(tracker.velocity(), { x: 0, y: 0 });

  tracker.addSample(0, 100, 0);
  tracker.addSample(16, 84, 16);
  tracker.addSample(32, 68, 32);
  tracker.addSample(48, 52, 48);
  const v = tracker.velocity();
  assert.ok(Math.abs(v.x - 1000) < 1, `expected vx ~ 1000px/s, got ${v.x}`);
  assert.ok(Math.abs(v.y - -1000) < 1, `expected vy ~ -1000px/s, got ${v.y}`);

  // Holding finger stationary for >100ms before lift drops velocity to 0
  tracker.addSample(48, 52, 200);
  assert.deepEqual(tracker.velocity(), { x: 0, y: 0 });

  tracker.addSample(68, 52, 220);
  assert.ok(tracker.velocity().x > 500);
  tracker.reset();
  assert.deepEqual(tracker.velocity(), { x: 0, y: 0 });
});

test('SpringVector2D and SpringRect preserve C1 velocity continuity across mid-flight retargets and release', () => {
  const vec = new SpringVector2D({ x: 0, y: 0 }, 0, { w: 22, zeta: 0.8 });
  vec.retarget({ x: 100, y: -50 }, 0);
  const mid = vec.sample(0.08);
  assert.equal(mid.moving, true);
  assert.ok(mid.x > 10 && mid.y < -5);

  vec.retarget({ x: -20, y: 80 }, 0.08, 34, 0.85);
  const after = vec.sample(0.08);
  assert.ok(Math.abs(after.x - mid.x) < 1e-9);
  assert.ok(Math.abs(after.y - mid.y) < 1e-9);
  assert.ok(Math.abs(after.vx - mid.vx) < 1e-9);
  assert.ok(Math.abs(after.vy - mid.vy) < 1e-9);

  const settledVec = vec.sample(10);
  assert.deepEqual(settledVec, { x: -20, y: 80, vx: 0, vy: 0, moving: false });

  const rect = new SpringRect({ x: 10, y: 20, width: 120, height: 48, radius: 10 }, 0, { w: 22 });
  rect.retarget({ x: 0, y: 0, width: 360, height: 480, radius: 24 }, 0);
  const rMid = rect.sample(0.06);
  assert.equal(rMid.moving, true);
  assert.ok(rMid.width > 120 && rMid.width < 360);
  assert.ok(rMid.radius > 10 && rMid.radius < 24);

  // Mid-flight interrupt back to card rect preserves exact instantaneous geometry
  rect.retarget({ x: 10, y: 20, width: 120, height: 48, radius: 10 }, 0.06);
  const rAfter = rect.sample(0.06);
  assert.ok(Math.abs(rAfter.width - rMid.width) < 1e-9);
  assert.ok(Math.abs(rAfter.height - rMid.height) < 1e-9);
  assert.ok(Math.abs(rAfter.radius - rMid.radius) < 1e-9);

  const rEnd = rect.sample(10);
  assert.deepEqual(rEnd, { x: 10, y: 20, width: 120, height: 48, radius: 10, moving: false });
});

test('useGestureSpring and useSharedAxis are SSR-safe and drive rubberBand + release velocity handoff', () => {
  let capturedGesture = null;
  let capturedShared = null;
  const frames = [];
  let releaseInfo = null;

  function Probe({ step, dir }) {
    capturedGesture = useGestureSpring({
      axis: 'y',
      bounds: { min: -50, max: 100, dimension: 120, resistance: 0.55 },
      resolveTarget: (val, vel) => (vel > 400 || val > 60 ? 100 : 0),
      onFrame: (v) => frames.push(v),
      onRelease: (info) => { releaseInfo = info; },
    });
    capturedShared = useSharedAxis(step, dir, { axis: 'x', distance: 16 });
    return h('div', { ...capturedGesture.handlers }, step);
  }

  const html = renderToStaticMarkup(h(Probe, { step: 'a', dir: 1 }));
  assert.match(html, /<div>a<\/div>/);
  assert.ok(capturedGesture && typeof capturedGesture.handlers.onPointerDown === 'function');
  assert.ok(capturedShared && capturedShared.direction === 1);

  const savedRaf = globalThis.requestAnimationFrame;
  const savedCaf = globalThis.cancelAnimationFrame;
  const savedPerf = globalThis.performance;
  let nowMs = 0;
  const rafQueue = new Map();
  let nextId = 1;
  globalThis.performance = { now: () => nowMs };
  globalThis.requestAnimationFrame = (cb) => { const id = nextId++; rafQueue.set(id, cb); return id; };
  globalThis.cancelAnimationFrame = (id) => { rafQueue.delete(id); };
  setMotionState(() => ({ reduced: false, hidden: false, paused: false }));

  try {
    // Drag upward past min (-50) to -150 -> rubber-banded between -50 and -170
    capturedGesture.handlers.onPointerDown({ pointerId: 1, button: 0, clientX: 0, clientY: 200, timeStamp: 0, currentTarget: {} });
    capturedGesture.handlers.onPointerMove({ pointerId: 1, clientX: 0, clientY: 50, timeStamp: 16 });
    const rubberVal = frames[frames.length - 1];
    assert.ok(rubberVal < -50 && rubberVal > -150, `expected rubber-banded overshoot, got ${rubberVal}`);

    // Fast downward flick to release -> velocity > 400 -> resolves target to 100 and hands off velocity to Track.release
    capturedGesture.handlers.onPointerMove({ pointerId: 1, clientX: 0, clientY: 220, timeStamp: 32 });
    capturedGesture.handlers.onPointerMove({ pointerId: 1, clientX: 0, clientY: 260, timeStamp: 48 });
    capturedGesture.handlers.onPointerUp({ pointerId: 1, clientX: 0, clientY: 260, timeStamp: 48, currentTarget: {} });

    assert.ok(releaseInfo && releaseInfo.velocity > 1000, `expected positive release velocity, got ${JSON.stringify(releaseInfo)}`);
    assert.equal(releaseInfo.target, 100);

    // Advance rAF frames and verify spring carries past 100 from release velocity then settles at 100
    let peak = -Infinity;
    for (let stepMs = 56; stepMs <= 1200 && rafQueue.size > 0; stepMs += 16) {
      nowMs = stepMs;
      for (const cb of [...rafQueue.values()]) { rafQueue.clear(); cb(); }
      peak = Math.max(peak, frames[frames.length - 1]);
    }
    assert.ok(peak > 100.5, `release velocity should carry value past target 100, peak=${peak}`);
    assert.equal(frames[frames.length - 1], 100);
  } finally {
    setMotionState(null);
    globalThis.requestAnimationFrame = savedRaf;
    globalThis.cancelAnimationFrame = savedCaf;
    globalThis.performance = savedPerf;
  }
});
