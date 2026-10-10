import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const DIRS = [
  'CommandPalette',
  'CommandPaletteInput',
  'CommandPaletteList',
  'CommandPaletteItem',
  'CommandPaletteGroup',
  'CommandPaletteEmpty',
  'CommandPaletteFooter',
  'Popover',
  'HoverCard',
  'Selector',
  'SelectorOption',
  'MultiSelector',
  'ComplexSelector',
  'Typeahead',
  'TypeaheadItem',
  'Tokenizer',
  'OverflowList',
];

const toKebab = (d) => d.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

test('command animations are token-driven and guarded', () => {
  for (const dir of DIRS) {
    const cssPath = `design/styles/primitives/${toKebab(dir)}.css`;
    if (!existsSync(cssPath)) continue;
    const css = readFileSync(cssPath, 'utf8');
    if (/(animation|transition|@keyframes)/.test(css)) {
      assert.ok(
        css.includes('var(--motion-') || css.includes('prefers-reduced-motion'),
        `${dir} animates without token or guard`,
      );
    }
  }
});

test('HoverCard exposes motion contract (Review Focus 2)', () => {
  const src = readFileSync('src/primitives/HoverCard/HoverCard.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion/);
  const m = JSON.parse(readFileSync('src/primitives/HoverCard/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
  assert.ok(m.properties.find((p) => p.id === 'entering'));
  assert.ok(m.properties.find((p) => p.id === 'exiting'));
});
