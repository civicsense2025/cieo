import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Tooltip links trigger to bubble', () => {
  const src = readFileSync('src/primitives/Tooltip/Tooltip.tsx', 'utf8');
  assert.match(src, /aria-describedby/); assert.match(src, /role="tooltip"/); assert.match(src, /useId/);
  assert.match(src, /cloneElement/, 'describedby must reach the actual trigger control');
});
test('Tooltip manifest requires text', () => {
  const m = JSON.parse(readFileSync('src/primitives/Tooltip/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.tooltip');
  assert.ok(m.properties.find((p) => p.id === 'text' && p.required === true));
});
test('Tooltip CSS reveals on hover and focus with reduced-motion guard', () => {
  const css = readFileSync('design/styles/primitives/tooltip.css', 'utf8');
  assert.match(css, /:hover/); assert.match(css, /focus-within/); assert.match(css, /prefers-reduced-motion/);
});
test('Overlay is a presentational scrim', () => {
  const src = readFileSync('src/primitives/Overlay/Overlay.tsx', 'utf8');
  assert.match(src, /aria-hidden="true"/); assert.match(src, /cieo-p-overlay/);
  assert.ok(!src.includes('onClick'), 'host owns dismissal');
});
test('Overlay CSS fixes the scrim to the viewport', () => {
  const css = readFileSync('design/styles/primitives/overlay.css', 'utf8');
  assert.match(css, /position:\s*fixed/); assert.match(css, /inset:\s*0/);
});
test('Overlay manifest is an atom', () => {
  const m = JSON.parse(readFileSync('src/primitives/Overlay/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.overlay'); assert.equal(m.layer, 'atom');
});
