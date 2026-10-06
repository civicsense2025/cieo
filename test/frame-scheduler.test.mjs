import test from 'node:test';
import assert from 'node:assert/strict';
import { FrameScheduler } from '../dist/live/frame-scheduler.js';
function clock() {
  let serial = 0; const jobs = new Map(); const cancelled = [];
  return { jobs, cancelled,
    request: callback => { const id = serial++; jobs.set(id, callback); return id; },
    cancel: id => { cancelled.push(id); jobs.delete(id); },
    tick: ms => { const values = [...jobs.values()]; jobs.clear(); values.forEach(fn => fn(ms)); },
  };
}
function setup(capacity) { const c = clock(); const errors = []; let allowed = true;
  return { c, errors, gate: v => { allowed = v; }, scheduler: new FrameScheduler({...c, allowed: () => allowed, onError: e => errors.push(e)}, capacity) };
}
test('cancelling the last job cancels RAF handle zero and calls completion once', () => {
  const {c, scheduler} = setup(); const reasons = []; const cancel = scheduler.start({step: () => true, finish: r => reasons.push(r)});
  assert.equal(c.jobs.size, 1); cancel(); cancel(); assert.deepEqual(c.cancelled, [0]);
  assert.equal(c.jobs.size, 0); assert.equal(scheduler.active, 0); assert.deepEqual(reasons, ['cancelled']);
});
test('a settled scheduler requests no idle frames', () => {
  const {c, scheduler} = setup(); let calls = 0; scheduler.start({step: () => { calls++; return false; }});
  c.tick(16); assert.equal(calls, 1); assert.equal(c.jobs.size, 0);
});
test('one throwing job does not strand another job', () => {
  const {c, scheduler, errors} = setup(); let called = false;
  scheduler.start({step: () => {throw new Error('boom');}});
  scheduler.start({step: () => {called = true; return false;}}); c.tick(16);
  assert.equal(called, true); assert.equal(errors.length, 1); assert.equal(scheduler.active, 0);
});
test('gating and disposal release jobs and reject new work after disposal', () => {
  const {c, scheduler, gate} = setup(); const reasons = [];
  scheduler.start({step: () => true, finish: r => reasons.push(r)}); gate(false); scheduler.sync();
  assert.deepEqual(reasons, ['gated']); assert.equal(c.jobs.size, 0);
  scheduler.dispose(); assert.throws(() => scheduler.start({step: () => false}));
});
test('capacity rejects before allocating an additional job', () => {
  const {scheduler} = setup(1); scheduler.start({step: () => true});
  assert.throws(() => scheduler.start({step: () => false}), RangeError); scheduler.dispose();
});
test('jobs added inside a frame start on the next frame only', () => {
  const {c, scheduler} = setup(); let child = 0;
  scheduler.start({step: () => {scheduler.start({step: () => {child++; return false;}}); return false;}});
  c.tick(10); assert.equal(child, 0); c.tick(20); assert.equal(child, 1);
});
