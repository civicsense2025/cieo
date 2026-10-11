// test/primitive-inventory.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from '../scripts/primitive-inventory.mjs';

test('reconcile maps ButtonGroup and flags collisions deterministically', () => {
  const out = reconcile({
    astryx: ['Button', 'ButtonGroup', 'AvatarGroup'],
    cieoControls: ['Button'],
    recipes: ['togglegroup', 'avatars'],
  });
  assert.deepEqual(out.unmapped, ['AvatarGroup', 'ButtonGroup']);
  assert.equal(out.collisions.length, 0);
  const again = reconcile({
    astryx: ['Button', 'ButtonGroup', 'AvatarGroup'],
    cieoControls: ['Button'],
    recipes: ['togglegroup', 'avatars'],
  });
  assert.deepEqual(out, again);
});

test('reconcile reports a collision when two recipes claim one id', () => {
  const out = reconcile({ astryx: [], cieoControls: [], recipes: ['avatars', 'avatars'] });
  assert.equal(out.collisions.length, 1);
  assert.equal(out.collisions[0].id, 'avatars');
});
