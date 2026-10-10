import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Field renders label with help-or-error row', () => {
  const src = readFileSync('src/primitives/Field/Field.tsx', 'utf8');
  assert.match(src, /<label/); assert.match(src, /role="alert"/); assert.match(src, /cieo-p-field/);
});
test('Field manifest requires label', () => {
  const m = JSON.parse(readFileSync('src/primitives/Field/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.field');
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
});
test('Field CSS uses tokens', () => {
  const css = readFileSync('design/styles/primitives/p-field.css', 'utf8');
  assert.match(css, /--cieo-text-small/); assert.match(css, /--cieo-color-danger/);
});
test('Slider re-exports Range with zero forks', () => {
  const src = readFileSync('src/primitives/Slider/Slider.tsx', 'utf8');
  assert.match(src, /Range as Slider/); assert.match(src, /controls\/Range\.js/);
  assert.ok(!src.includes('function Slider'), 'no behavior fork');
});
test('Slider manifest wraps Range', () => {
  const m = JSON.parse(readFileSync('src/primitives/Slider/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.slider');
});
