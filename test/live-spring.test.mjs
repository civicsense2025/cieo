import test from 'node:test';
import assert from 'node:assert/strict';
import { SpringChannel } from '../dist/live/spring-channel.js';
const close = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) <= e, `${a} differs from ${b}`);
test('live spring preserves position and velocity when interrupted or changing frequency', () => {
  const channel = new SpringChannel(0, 0); channel.retarget(100, 0);
  const before = channel.sample(.1); channel.retarget(-20, .1, 34); const after = channel.sample(.1);
  close(before.value, after.value); close(before.velocity, after.velocity);
});
test('critical step from rest approaches its target without overshoot', () => {
  const channel = new SpringChannel(0, 0); channel.retarget(1, 0); let previous = 0;
  for (let i = 0; i < 1000; i++) { const {value} = channel.sample(i / 120); assert.ok(value >= previous && value <= 1); previous = value; }
});
test('position zero crossing with velocity is not treated as settled', () => {
  const channel = new SpringChannel(0, 0); channel.release(0, 100, 0, 0);
  const current = channel.sample(0); assert.equal(current.moving, true); assert.equal(current.value, 0);
  assert.ok(channel.sample(.02).value > 0);
});
test('long sleep settles without nonfinite multiplication', () => {
  const channel = new SpringChannel(1e12, 0); channel.release(1e12, 1e12, -1e12, 0, .001);
  assert.deepEqual(channel.sample(Number.MAX_SAFE_INTEGER), {value: -1e12, velocity: 0, moving: false});
});
test('invalid input is rejected before mutating a live spring', () => {
  const channel = new SpringChannel(0, 1); const prior = channel.sample(1);
  for (const bad of [NaN, Infinity, -Infinity, 1e13]) assert.throws(() => channel.retarget(bad, 1));
  assert.throws(() => channel.retarget(1, .5)); assert.throws(() => channel.retarget(1, 1, 0));
  assert.deepEqual(channel.sample(1), prior);
});
test('100000 retargets retain a fixed-size state, not an event array', () => {
  const channel = new SpringChannel(0, 0); const keys = Object.keys(channel);
  for (let i = 0; i < 100000; i++) channel.retarget(i % 19, i / 1000);
  assert.deepEqual(Object.keys(channel), keys); assert.ok(Object.values(channel).every(v => typeof v === 'number'));
});
