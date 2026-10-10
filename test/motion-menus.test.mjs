import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const DIRS = [
  'ToggleButton',
  'ToggleButtonGroup',
  'DropdownMenu',
  'DropdownMenuItem',
  'DropdownMenuGroup',
  'DropdownMenuCheckboxItem',
  'DropdownMenuRadioGroup',
  'DropdownMenuRadioItem',
  'DropdownMenuDivider',
  'DropdownMenuSubMenu',
  'MoreMenu',
  'SegmentedControl',
  'SegmentedControlItem',
  'Tab',
  'TabList',
  'TabMenu',
  'ButtonGroup',
  'IconButton',
  'Toolbar',
];

const toKebab = (d) => d.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

test('menus animations are token-driven and guarded', () => {
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

test('DropdownMenuSubMenu exposes full motion trio', () => {
  const src = readFileSync('src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion, entering, exiting \}\)/);
  const m = JSON.parse(readFileSync('src/primitives/DropdownMenuSubMenu/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
  assert.ok(m.properties.find((p) => p.id === 'entering'));
  assert.ok(m.properties.find((p) => p.id === 'exiting'));
});

test('TabList exposes motion opt-out', () => {
  const src = readFileSync('src/primitives/TabList/TabList.tsx', 'utf8');
  assert.match(src, /data-motion=\{motion === false \? 'off' : undefined\}/);
  const m = JSON.parse(readFileSync('src/primitives/TabList/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
});

test('TabMenu takes no motion props (audit-only)', () => {
  const src = readFileSync('src/primitives/TabMenu/TabMenu.tsx', 'utf8');
  assert.ok(!src.includes('MotionProps'), 'TabMenu gained unplanned motion API');
});
