// test/primitives-button-group.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('ButtonGroup renders role=group with accessible label and orientation', () => {
  const src = readFileSync('src/primitives/ButtonGroup/ButtonGroup.tsx', 'utf8');
  assert.match(src, /role="group"/);
  assert.match(src, /aria-label=\{label\}/);
  assert.match(src, /data-orientation/);
  assert.match(src, /orientation\s*=\s*'horizontal'/);
});

test('ButtonGroup manifest declares label prop and group slot', () => {
  const m = JSON.parse(readFileSync('src/primitives/ButtonGroup/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.button-group');
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
  assert.ok(m.slots.find((s) => s.id === 'default'));
});

test('ButtonGroup CSS uses tokens and collapses adjoining borders', () => {
  const css = readFileSync('design/styles/primitives/button-group.css', 'utf8');
  assert.match(css, /--cieo-color-border-strong/);
  assert.match(css, /margin-inline-start:\s*-1px|border-start-start-radius/);
  assert.match(css, /:not\(:first-child\):not\(:last-child\)/);
});
