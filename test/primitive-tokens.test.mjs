import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// The preview controls (corners, density, brand, mode) only reach a primitive that styles itself with tokens. These two
// pins keep that true: no new literal colors, and the count of literal pixel sizes can only go down.
const dir = (d) => readdirSync(d).filter((f) => f.endsWith('.css')).map((f) => [`${d}/${f}`, readFileSync(`${d}/${f}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')]);
const sheets = [...dir('design/styles'), ...dir('design/styles/primitives')];
const COLOR_ALLOWED = new Set(['design/styles/accessibility.css', 'design/styles/primitives/preview-stage.css', 'design/styles/primitives/overlay.css', 'design/styles/primitives/new-items-pill.css']);
const PIXEL_CEILING = 99;

test('primitive styles use color tokens, never literal colors (forced-colors, scrims and the preview stage excepted)', () => {
  const bad = sheets.filter(([f, css]) => !COLOR_ALLOWED.has(f) && /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(css)).map(([f]) => f);
  assert.deepEqual(bad, []);
});

test('literal pixel sizes in primitive styles never grow past the current ceiling', () => {
  const count = sheets.reduce((n, [, css]) => n + (css.match(/(?<![\w.#-])(?:[2-9]|\d{2,})(?:\.\d+)?px\b/g) ?? []).length, 0);
  assert.ok(count <= PIXEL_CEILING, `${count} literal px values; tokens first, then lower the ceiling`);
});

test('badges and chips follow the Corners setting instead of staying pills', () => {
  assert.doesNotMatch(readFileSync('design/styles/primitives/follow-button.css', 'utf8'), /radius-pill/);
  assert.match(readFileSync('design/styles/controls.css', 'utf8'), /\.cieo-badge \{[^}]*radius-control/);
});
