import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('List renders list element with label', () => {
  const src = readFileSync('src/primitives/List/List.tsx', 'utf8');
  assert.match(src, /ordered \? 'ol' : 'ul'/); assert.match(src, /aria-label=\{label\}/); assert.match(src, /cieo-p-list/);
});
test('List manifest declares order and label', () => {
  const m = JSON.parse(readFileSync('src/primitives/List/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.list');
  assert.ok(m.properties.find((p) => p.id === 'ordered'));
});
test('ListItem renders li wrapper', () => {
  const src = readFileSync('src/primitives/ListItem/ListItem.tsx', 'utf8');
  assert.match(src, /<li/); assert.match(src, /cieo-p-list-item/);
});
test('ListItem manifest is an atom', () => {
  const m = JSON.parse(readFileSync('src/primitives/ListItem/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.list-item'); assert.equal(m.layer, 'atom');
});
test('List CSS divides rows with tokens', () => {
  const css = readFileSync('design/styles/primitives/list.css', 'utf8');
  assert.match(css, /--cieo-color-border/); assert.match(css, /:last-child/);
});
