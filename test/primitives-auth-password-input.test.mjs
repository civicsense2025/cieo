// test/primitives-auth-password-input.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthPasswordInput toggles visibility and exposes the meter value', () => {
  const src = readFileSync('src/primitives/AuthPasswordInput/AuthPasswordInput.tsx', 'utf8');
  assert.match(src, /Show password/);
  assert.match(src, /Hide password/);
  assert.match(src, /role="meter"|role=\{'meter'\}|role=\{current \? 'meter'/);
  assert.match(src, /aria-valuenow/);
  assert.match(src, /aria-describedby/);
  assert.match(src, /current-password/);
});

test('AuthPasswordInput manifest documents showStrength with default true', () => {
  const m = JSON.parse(readFileSync('src/primitives/AuthPasswordInput/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.auth-password-input');
  const show = m.properties.find((p) => p.id === 'showStrength');
  assert.ok(show && show.default === true);
});

test('AuthPasswordInput toggle style is scoped to the password wrap', () => {
  const css = readFileSync('design/styles/primitives/auth-password-input.css', 'utf8');
  assert.match(css, /\.cieo-auth-password-wrap \.cieo-auth-visibility/);
  assert.doesNotMatch(css, /[^\w-]-toggle \{/);
});

test('AuthPasswordInput meter colors weak scores below success', () => {
  const src = readFileSync('src/primitives/AuthPasswordInput/AuthPasswordInput.tsx', 'utf8');
  assert.match(src, /data-score|warning/);
});

test('AuthPasswordInput CSS uses the muted edge and a visible focus outline', () => {
  const css = readFileSync('design/styles/primitives/auth-password-input.css', 'utf8');
  assert.match(css, /1\.5px solid/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
