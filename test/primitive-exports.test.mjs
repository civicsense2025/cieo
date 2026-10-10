import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

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

test('dist primitives barrel exists and resolves both symbols as functions', async () => {
  assert.ok(existsSync('dist/primitives/index.js'), 'missing dist/primitives/index.js (run npm run build first)');
  assert.ok(existsSync('dist/primitives/index.d.ts'), 'missing dist/primitives/index.d.ts (run npm run build first)');
  const barrel = await import(pathToFileURL('dist/primitives/index.js').href);
  assert.equal(typeof barrel.ButtonGroup, 'function', 'ButtonGroup did not resolve as a function');
  assert.equal(typeof barrel.AvatarGroup, 'function', 'AvatarGroup did not resolve as a function');
});

test('docs template renders props from manifest and empty state', () => {
  const html = readFileSync('site/component.html', 'utf8');
  assert.match(html, /data-props/);
  assert.match(html, /Not documented yet/);
  assert.match(html, /data-preview/);
  assert.match(html, /On this page/);
});
