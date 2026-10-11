import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('IconButton renders labelled button with size', () => {
  const src = readFileSync('src/primitives/IconButton/IconButton.tsx', 'utf8');
  assert.match(src, /<button/); assert.match(src, /aria-label=\{label\}/); assert.match(src, /data-size/);
});
test('IconButton manifest requires label', () => {
  const m = JSON.parse(readFileSync('src/primitives/IconButton/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.icon-button');
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
});
test('IconButton CSS is square with tokens', () => {
  const css = readFileSync('design/styles/primitives/icon-button.css', 'utf8');
  assert.match(css, /aspect-ratio:\s*1/); assert.match(css, /--cieo-radius-control/);
});
test('Toolbar renders role=toolbar with title and actions', () => {
  const src = readFileSync('src/primitives/Toolbar/Toolbar.tsx', 'utf8');
  assert.match(src, /role="toolbar"/); assert.match(src, /aria-label=\{label\}/);
});
test('Toolbar manifest has label and slots', () => {
  const m = JSON.parse(readFileSync('src/primitives/Toolbar/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.toolbar');
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
  assert.ok(m.slots.find((s) => s.id === 'default'));
});
