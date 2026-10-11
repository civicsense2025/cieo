// test/primitives-auth-email-field.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthEmailField labels the input and wires the error', () => {
  const src = readFileSync('src/primitives/AuthEmailField/AuthEmailField.tsx', 'utf8');
  assert.match(src, /htmlFor/);
  assert.match(src, /aria-describedby/);
  assert.match(src, /role="alert"|role=\{'alert'\}/);
  assert.match(src, /type="email"|type=\{'email'\}/);
  assert.match(src, /autoComplete="email"|autoComplete=\{'email'\}/);
});

test('AuthEmailField manifest documents id, label, error, disabled', () => {
  const m = JSON.parse(readFileSync('src/primitives/AuthEmailField/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.auth-email-field');
  assert.ok(m.properties.find((p) => p.id === 'id' && p.required === true));
  assert.ok(m.properties.find((p) => p.id === 'label'));
  assert.ok(m.properties.find((p) => p.id === 'error'));
  assert.ok(m.properties.find((p) => p.id === 'disabled'));
});

test('AuthEmailField CSS uses the muted edge and a visible focus outline', () => {
  const css = readFileSync('design/styles/primitives/auth-email-field.css', 'utf8');
  assert.match(css, /1\.5px solid/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
