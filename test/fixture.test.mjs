import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resp, vel } from '../dist/core/spring.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/spring.json', import.meta.url), 'utf8'));

test('core resp and vel match the shared spring fixture', () => {
  for (const [name, { w, cases }] of Object.entries(fixture)) {
    for (const c of cases) {
      assert.ok(Math.abs(resp(c.dt, c.x0, c.v0, { w }) - c.resp) < 1e-9, `${name} resp dt=${c.dt}`);
      assert.ok(Math.abs(vel(c.dt, c.x0, c.v0, { w }) - c.vel) < 1e-9, `${name} vel dt=${c.dt}`);
    }
  }
});
