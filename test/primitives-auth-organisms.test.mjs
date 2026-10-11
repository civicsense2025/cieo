// test/primitives-auth-organisms.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthSignInCard composes credentials with heading, routes, and status', () => {
  const src = readFileSync('src/primitives/AuthSignInCard/AuthSignInCard.tsx', 'utf8');
  assert.match(src, /AuthCredentialForm/);
  assert.match(src, /<h2/);
  assert.match(src, /role="status"|role=\{'status'\}/);
});

test('AuthSignUpCard, AuthResetFlow, and AuthMfaFlow compose their molecules', () => {
  assert.match(readFileSync('src/primitives/AuthSignUpCard/AuthSignUpCard.tsx', 'utf8'), /AuthCredentialForm/);
  assert.match(readFileSync('src/primitives/AuthResetFlow/AuthResetFlow.tsx', 'utf8'), /AuthResetForm/);
  assert.match(readFileSync('src/primitives/AuthMfaFlow/AuthMfaFlow.tsx', 'utf8'), /AuthMfaChallenge/);
  assert.match(readFileSync('src/primitives/AuthMfaFlow/AuthMfaFlow.tsx', 'utf8'), /resend/i);
});

test('Auth organism manifests carry the organism layer', () => {
  for (const n of ['AuthSignInCard', 'AuthSignUpCard', 'AuthResetFlow', 'AuthMfaFlow']) {
    const m = JSON.parse(readFileSync(`src/primitives/${n}/manifest.json`, 'utf8'));
    assert.equal(m.layer, 'organism');
  }
});
