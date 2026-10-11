// test/primitives-auth-molecules.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthCredentialForm composes email and password with pending and alert', () => {
  const src = readFileSync('src/primitives/AuthCredentialForm/AuthCredentialForm.tsx', 'utf8');
  assert.match(src, /AuthEmailField/);
  assert.match(src, /AuthPasswordInput/);
  assert.match(src, /pending/);
  assert.match(src, /role="alert"|role=\{'alert'\}/);
  assert.match(src, /signin.*signup|mode/);
});

test('AuthMfaChallenge toggles between OTP and recovery with named submits', () => {
  const src = readFileSync('src/primitives/AuthMfaChallenge/AuthMfaChallenge.tsx', 'utf8');
  assert.match(src, /AuthOtpInput/);
  assert.match(src, /recovery/i);
  assert.match(src, /onRecovery/);
  assert.match(src, /role="alert"|role=\{'alert'\}/);
});

test('AuthResetForm switches request and confirm steps', () => {
  const src = readFileSync('src/primitives/AuthResetForm/AuthResetForm.tsx', 'utf8');
  assert.match(src, /request/);
  assert.match(src, /confirm/);
  assert.match(src, /onRequest/);
  assert.match(src, /onConfirm/);
});

test('Auth molecule manifests carry the molecule layer', () => {
  for (const n of ['AuthCredentialForm', 'AuthMfaChallenge', 'AuthResetForm']) {
    const m = JSON.parse(readFileSync(`src/primitives/${n}/manifest.json`, 'utf8'));
    assert.equal(m.layer, 'molecule');
  }
});
