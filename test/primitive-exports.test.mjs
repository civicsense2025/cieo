import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const { names } = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8'));

test('package.json exposes deep primitive exports with types', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.ok(names.length > 100, `expected the full library, got ${names.length} names`);
  for (const name of names) {
    const key = `./${name}`;
    assert.ok(pkg.exports[key], `missing exports[${key}]`);
    assert.ok(pkg.exports[key].types, `${key} missing types`);
    assert.ok(pkg.exports[key].default, `${key} missing default`);
  }
  assert.ok(pkg.exports['./primitives'], 'missing exports[./primitives]');
});

test('primitives barrel re-exports all lanes', () => {
  const src = readFileSync('src/primitives/index.ts', 'utf8');
  for (const name of names) {
    assert.match(src, new RegExp(name));
  }
});

test('dist primitives barrel exists and resolves all symbols as functions', async () => {
  assert.ok(existsSync('dist/primitives/index.js'), 'missing dist/primitives/index.js (run npm run build first)');
  assert.ok(existsSync('dist/primitives/index.d.ts'), 'missing dist/primitives/index.d.ts (run npm run build first)');
  const barrel = await import(pathToFileURL('dist/primitives/index.js').href);
  for (const name of names) {
    const v = barrel[name];
    const isComponent = typeof v === 'function' || (v !== null && typeof v === 'object' && '$$typeof' in v);
    assert.ok(isComponent, `${name} did not resolve as a component (got ${typeof v})`);
  }
});

test('docs template renders props from manifest and empty state', () => {
  const html = readFileSync('site/component.html', 'utf8');
  assert.match(html, /data-props/);
  assert.match(html, /Not documented yet/);
  assert.match(html, /data-preview/);
  assert.match(html, /On this page/);
});
