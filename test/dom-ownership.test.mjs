import test from 'node:test';
import assert from 'node:assert/strict';
import { animate, owners } from '../dist/dom/index.js';
import { active, run, setMotionState } from '../dist/core/spring.js';

function element() {
  const values = new Map([['opacity', '0.7']]);
  return {
    style: {
      getPropertyValue: key => values.get(key) ?? '',
      getPropertyPriority: () => '',
      setProperty: (key, value) => values.set(key, value),
      removeProperty: key => values.delete(key),
    },
    hasAttribute: () => true,
    getAttribute: () => 'opacity:0.7',
    removeAttribute() {},
  };
}

test('synchronous reduced-motion completion releases ownership and styles', () => {
  const el = element();
  setMotionState(() => ({ reduced: true }));
  try {
    let finishes = 0;
    const cancel = animate([el, el], { step: () => true, finish: () => finishes++ });
    cancel(); cancel();
    assert.equal(finishes, 1);
    assert.equal(owners.has(el), false);
    assert.equal(el.style.getPropertyValue('opacity'), '0.7');
  } finally { setMotionState(null); }
});

test('first-frame failure restores touched styles and removes owner', () => {
  const el = element();
  assert.throws(() => animate([el], { step: () => {
    el.style.setProperty('opacity', '0');
    throw new Error('paint failed');
  } }), /paint failed/);
  assert.equal(owners.has(el), false);
  assert.equal(el.style.getPropertyValue('opacity'), '0.7');
});

test('last legacy job cancellation releases RAF handle zero once', () => {
  const previous = { request: globalThis.requestAnimationFrame, cancel: globalThis.cancelAnimationFrame };
  const cancelled = [];
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = handle => cancelled.push(handle);
  try {
    const cancel = run({ step: () => true });
    assert.equal(active(), 1);
    cancel(); cancel();
    assert.equal(active(), 0);
    assert.deepEqual(cancelled, [0]);
  } finally {
    if (previous.request) globalThis.requestAnimationFrame = previous.request;
    else delete globalThis.requestAnimationFrame;
    if (previous.cancel) globalThis.cancelAnimationFrame = previous.cancel;
    else delete globalThis.cancelAnimationFrame;
  }
});
