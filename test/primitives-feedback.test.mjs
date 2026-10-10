import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Spinner announces status with labelled ring', () => {
  const src = readFileSync('src/primitives/Spinner/Spinner.tsx', 'utf8');
  assert.match(src, /role="status"/); assert.match(src, /aria-label=\{label\}/);
});
test('Spinner CSS rotates with reduced-motion rest', () => {
  const css = readFileSync('design/styles/primitives/spinner.css', 'utf8');
  assert.match(css, /@keyframes cieo-spin/); assert.match(css, /prefers-reduced-motion/);
});
test('Spinner manifest declares label and size', () => {
  const m = JSON.parse(readFileSync('src/primitives/Spinner/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.spinner');
  assert.ok(m.properties.find((p) => p.id === 'size'));
});
test('ProgressBar renders native progress with label', () => {
  const src = readFileSync('src/primitives/ProgressBar/ProgressBar.tsx', 'utf8');
  assert.match(src, /<progress/); assert.match(src, /aria-label=\{label\}/); assert.match(src, /cieo-progress/);
  assert.ok(!src.includes('animation'), 'ProgressBar owns no motion');
});
test('ProgressBar manifest requires value and label', () => {
  const m = JSON.parse(readFileSync('src/primitives/ProgressBar/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.progress-bar');
  assert.ok(m.properties.find((p) => p.id === 'value' && p.required === true));
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
});
