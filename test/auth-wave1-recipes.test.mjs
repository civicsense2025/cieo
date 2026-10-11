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
