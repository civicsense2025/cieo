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
  assert.ok(!src.includes('title='), 'hidden stack must not re-expose names via title tooltips');
  assert.match(src, /key=\{`?\$\{p\.name\}/);
  assert.match(src, /\(p,\s*i\)/);
});

test('AvatarGroup manifest requires people with name and initials', () => {
  const m = JSON.parse(readFileSync('src/primitives/AvatarGroup/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.avatar-group');
  const people = m.properties.find((p) => p.id === 'people');
  assert.ok(people && people.required === true);
  const size = m.properties.find((p) => p.id === 'size');
  assert.ok(size && size.default === 'md', 'manifest must document size with default md');
  assert.ok(m.properties.find((p) => p.id === 'style'), 'manifest must document style passthrough');
  assert.ok(m.platforms[0].properties.includes('size'), 'platform must list size');
});

test('AvatarGroup CSS overlaps tightly, rings, and respects reduced motion', () => {
  const css = readFileSync('design/styles/primitives/avatar-group.css', 'utf8');
  assert.match(css, /margin-inline-start:\s*-/);
  assert.match(css, /prefers-reduced-motion/);
});
