import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('stage-a animations are token-driven and guarded', () => {
  for (const dir of ['Dialog', 'DialogHeader', 'AlertDialog', 'BottomSheet', 'BottomSheetSwitcher', 'Lightbox', 'Tooltip', 'Overlay']) {
    const p = `design/styles/primitives/${dir.toLowerCase()}.css`;
    if (!existsSync(p)) continue;
    const css = readFileSync(p, 'utf8');
    if (/(animation|transition|@keyframes)/.test(css)) assert.ok(css.includes('var(--motion-') || css.includes('prefers-reduced-motion'), `${dir} animates without token or guard`);
  }
});

test('Tooltip exposes motion contract (Review Focus 2)', () => {
  const src = readFileSync('src/primitives/Tooltip/Tooltip.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion/);
  const m = JSON.parse(readFileSync('src/primitives/Tooltip/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
  assert.ok(m.properties.find((p) => p.id === 'entering'));
  assert.ok(m.properties.find((p) => p.id === 'exiting'));
});

test('Dialog exposes motion contract (Review Focus 2)', () => {
  const src = readFileSync('src/primitives/Dialog/Dialog.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion/);
  const m = JSON.parse(readFileSync('src/primitives/Dialog/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
  assert.ok(m.properties.find((p) => p.id === 'entering'));
  assert.ok(m.properties.find((p) => p.id === 'exiting'));
});

test('BottomSheet exposes motion contract (Review Focus 2)', () => {
  const src = readFileSync('src/primitives/BottomSheet/BottomSheet.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion/);
  const m = JSON.parse(readFileSync('src/primitives/BottomSheet/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
  assert.ok(m.properties.find((p) => p.id === 'entering'));
  assert.ok(m.properties.find((p) => p.id === 'exiting'));
});

test('Lightbox exposes motion contract (Review Focus 2)', () => {
  const src = readFileSync('src/primitives/Lightbox/Lightbox.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion/);
  const m = JSON.parse(readFileSync('src/primitives/Lightbox/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
  assert.ok(m.properties.find((p) => p.id === 'entering'));
  assert.ok(m.properties.find((p) => p.id === 'exiting'));
});
