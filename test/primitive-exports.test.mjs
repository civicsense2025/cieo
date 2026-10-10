import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package.json exposes deep primitive exports with types', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const key of ['./ButtonGroup', './AvatarGroup', './primitives']) {
    assert.ok(pkg.exports[key], `missing exports[${key}]`);
    assert.ok(pkg.exports[key].types, `${key} missing types`);
    assert.ok(pkg.exports[key].default, `${key} missing default`);
  }
});

test('primitives barrel re-exports both proofs', () => {
  const src = readFileSync('src/primitives/index.ts', 'utf8');
  assert.match(src, /ButtonGroup/);
  assert.match(src, /AvatarGroup/);
});

test('docs template renders props from manifest and empty state', () => {
  const html = readFileSync('site/component.html', 'utf8');
  assert.match(html, /data-props/);
  assert.match(html, /Not documented yet/);
  assert.match(html, /data-preview/);
  assert.match(html, /On this page/);
});
