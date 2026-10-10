import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Badge renders design-system badge with status', () => {
  const src = readFileSync('src/primitives/Badge/Badge.tsx', 'utf8');
  assert.match(src, /cieo-badge/); assert.match(src, /data-status/);
  assert.ok(!src.includes('background:'), 'Badge owns no paint');
});
test('Badge manifest declares five statuses', () => {
  const m = JSON.parse(readFileSync('src/primitives/Badge/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.badge');
  assert.equal(m.properties.find((p) => p.id === 'status').type.values.length, 5);
});
test('Text renders chosen element with size', () => {
  const src = readFileSync('src/primitives/Text/Text.tsx', 'utf8');
  assert.match(src, /data-size/); assert.match(src, /cieo-p-text/);
});
test('Text manifest declares element and size', () => {
  const m = JSON.parse(readFileSync('src/primitives/Text/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.text');
  assert.ok(m.properties.find((p) => p.id === 'as'));
  assert.ok(m.properties.find((p) => p.id === 'size'));
});
test('Text CSS uses tokens', () => {
  const css = readFileSync('design/styles/primitives/p-text.css', 'utf8');
  assert.match(css, /--cieo-text-small/);
});
