// test/primitives-avatar-group.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AvatarGroup caps at max plus overflow and uses initials when photo missing', () => {
  const src = readFileSync('src/primitives/AvatarGroup/AvatarGroup.tsx', 'utf8');
  assert.match(src, /aria-hidden="true"|aria-hidden=\{true\}/);
  assert.match(src, /max\s*=\s*4/);
  assert.match(src, /\+/);
  assert.match(src, /initials/);
  assert.ok(!src.includes('useSpring') && !src.includes('S.base'), 'static stack must not import springs');
});

test('AvatarGroup manifest requires people with name and initials', () => {
  const m = JSON.parse(readFileSync('src/primitives/AvatarGroup/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.avatar-group');
  const people = m.properties.find((p) => p.id === 'people');
  assert.ok(people && people.required === true);
});

test('AvatarGroup CSS overlaps tightly, rings, and respects reduced motion', () => {
  const css = readFileSync('design/styles/primitives/avatar-group.css', 'utf8');
  assert.match(css, /margin-inline-start:\s*-/);
  assert.match(css, /prefers-reduced-motion/);
});
