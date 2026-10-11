import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('layout animations are token-driven and guarded', () => {
  for (const dir of ['Section', 'Center', 'AspectRatio', 'FormLayout', 'Grid', 'GridSpan', 'Layout', 'LayoutContent', 'LayoutHeader', 'LayoutFooter', 'LayoutPanel', 'HStack', 'VStack', 'StackItem', 'ScrollableArea', 'AppShell', 'Stack', 'Divider']) {
    const p = `design/styles/primitives/${dir.toLowerCase()}.css`;
    if (!existsSync(p)) continue;
    const css = readFileSync(p, 'utf8');
    if (/(animation|transition|@keyframes)/.test(css)) assert.ok(css.includes('var(--motion-') || css.includes('prefers-reduced-motion'), `${dir} animates without token or guard`);
  }
});

test('layout components take no motion props', () => {
  for (const dir of ['Section', 'Grid', 'AppShell', 'Stack']) {
    const src = readFileSync(`src/primitives/${dir}/${dir}.tsx`, 'utf8');
    assert.ok(!src.includes('MotionProps'), `${dir} gained unplanned motion API`);
  }
});
