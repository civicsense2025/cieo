// test/auth-wave1-recipes.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, globSync } from 'node:fs';

const sources = globSync('atoms/web/blocks/*.js').map((f) => readFileSync(f, 'utf8')).join('\n');

for (const id of ['auth-magic-link', 'auth-mfa-challenge', 'auth-reset']) {
  test(`Wave 1 recipe ${id} exists with init`, () => {
    assert.match(sources, new RegExp(`id:'${id}'`));
  });
}

test('Wave 1 magic link disables send while the countdown runs', () => {
  const src = readFileSync('atoms/web/blocks/558-auth-wave1.js', 'utf8');
  assert.match(src, /snd\.disabled/);
});

test('Wave 1 recipes guard resend, normalize recovery codes, and swap reset steps', () => {
  const src = readFileSync('atoms/web/blocks/558-auth-wave1.js', 'utf8');
  assert.match(src, /resendToken|guard/);
  assert.match(src, /replace\(.+\\D/);
  assert.match(src, /new Swap/);
});

test('Wave 1 MFA and reset recipes animate structural state instead of toggling hidden', () => {
  const src = readFileSync('atoms/web/blocks/558-auth-wave1.js', 'utf8');
  const mfa = src.slice(src.indexOf("id:'auth-mfa-challenge'"), src.indexOf("id:'auth-reset'"));
  const reset = src.slice(src.indexOf("id:'auth-reset'"));
  assert.match(mfa, /new Swap/);
  assert.match(mfa, /new Track/);
  assert.doesNotMatch(mfa, /\.hidden\s*=/);
  assert.match(reset, /new Swap/);
  assert.match(reset, /new Track/);
  assert.doesNotMatch(reset, /\.hidden\s*=/);
  assert.match(mfa, /motionSettings\(st\)/);
  assert.match(mfa, /changedToReduced/);
  assert.match(reset, /motionSettings\(st\)/);
  assert.match(reset, /changedToReduced/);
});

test('Wave 1 magic-link recipe reads the motion policy when sending and while rendering', () => {
  const src = readFileSync('atoms/web/blocks/558-auth-wave1.js', 'utf8');
  const magic = src.slice(src.indexOf("id:'auth-magic-link'"), src.indexOf("id:'auth-mfa-challenge'"));
  assert.match(magic, /motionSettings\(st\)/);
  assert.match(magic, /motion\.reduced\(\)/);
  assert.match(magic, /motion\.changedToReduced\(\)/);
});
