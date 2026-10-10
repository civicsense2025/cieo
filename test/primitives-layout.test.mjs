import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Stack renders grid with gap', () => {
  const src = readFileSync('src/primitives/Stack/Stack.tsx', 'utf8');
  assert.match(src, /data-gap/); assert.match(src, /cieo-p-stack/);
});
test('Stack manifest declares gap', () => {
  const m = JSON.parse(readFileSync('src/primitives/Stack/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.stack'); assert.ok(m.properties.find((p) => p.id === 'gap'));
});
test('Stack CSS uses spacing tokens', () => {
  const css = readFileSync('design/styles/primitives/stack.css', 'utf8');
  assert.match(css, /--cieo-space-4/);
});
test('Divider renders hr with optional label', () => {
  const src = readFileSync('src/primitives/Divider/Divider.tsx', 'utf8');
  assert.match(src, /<hr/); assert.match(src, /aria-label=\{label\}/);
});
test('Divider manifest is an atom', () => {
  const m = JSON.parse(readFileSync('src/primitives/Divider/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.divider'); assert.equal(m.layer, 'atom');
});
