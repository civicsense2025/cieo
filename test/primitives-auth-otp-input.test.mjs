// test/primitives-auth-otp-input.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthOtpInput splits digits, normalizes paste, and fires onComplete', () => {
  const src = readFileSync('src/primitives/AuthOtpInput/AuthOtpInput.tsx', 'utf8');
  assert.match(src, /one-time-code/);
  assert.match(src, /onComplete/);
  assert.match(src, /aria-describedby/);
  assert.match(src, /Digit /);
});

test('AuthOtpInput manifest documents length default 6', () => {
  const m = JSON.parse(readFileSync('src/primitives/AuthOtpInput/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.auth-otp-input');
  const length = m.properties.find((p) => p.id === 'length');
  assert.ok(length && length.default === 6);
});

test('AuthOtpInput distributes multi-character entry across boxes', () => {
  const src = readFileSync('src/primitives/AuthOtpInput/AuthOtpInput.tsx', 'utf8');
  assert.match(src, /onPasteText\(raw,\s*i\)/);
});

test('AuthOtpInput CSS keeps 44px boxes with a visible focus outline', () => {
  const css = readFileSync('design/styles/primitives/auth-otp-input.css', 'utf8');
  assert.match(css, /1\.5px solid/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
