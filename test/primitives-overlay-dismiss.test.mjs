// test/primitives-overlay-dismiss.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Overlay } from '../dist/primitives/Overlay/Overlay.js';
import { Popover } from '../dist/primitives/Popover/Popover.js';
import { TopNavMegaMenu } from '../dist/primitives/TopNavMegaMenu/TopNavMegaMenu.js';
import { CommandPalette } from '../dist/primitives/CommandPalette/CommandPalette.js';
import { CommandPaletteInput } from '../dist/primitives/CommandPaletteInput/CommandPaletteInput.js';
import { AlertDialog } from '../dist/primitives/AlertDialog/AlertDialog.js';
import { Tooltip } from '../dist/primitives/Tooltip/Tooltip.js';
import { HoverCard } from '../dist/primitives/HoverCard/HoverCard.js';

const src = (n) => readFileSync(`src/primitives/${n}/${n}.tsx`, 'utf8');

test('Overlay forwards a press to the host; without onPress it stays inert and hidden', () => {
  assert.match(renderToStaticMarkup(h(Overlay)), /aria-hidden="true"/);
  assert.match(src('Overlay'), /onClick=\{onPress\}/);
});

test('Dialog, BottomSheet and Lightbox close on Escape from anywhere, on scrim press, trap focus and restore it', () => {
  for (const n of ['Dialog', 'BottomSheet', 'Lightbox']) {
    const s = src(n);
    assert.match(s, /useDismiss\(open \?\? false, \(\) => onClose\?\.\(\), \[ref\], \{ outside: false \}\)/, `${n} document Escape`);
    assert.match(s, /useModalFocus\(open \?\? false, ref\)/, `${n} focus management`);
    assert.match(s, /<Overlay onPress=\{dismissOnOutsidePress \? onClose : undefined\} \/>/, `${n} scrim press`);
    assert.match(s, /tabIndex=\{-1\}/, `${n} focusable panel`);
  }
});

test('AlertDialog is one alertdialog (not a dialog wrapping one) and never closes from the scrim', () => {
  const s = src('AlertDialog');
  assert.match(s, /role="alertdialog"/);
  assert.match(s, /dismissOnOutsidePress=\{false\}/);
  assert.doesNotMatch(s, /if \(!open\) return null/);
  assert.equal(renderToStaticMarkup(h(AlertDialog, { label: 'x', open: false }, 'body')), '');
});

test('Popover trigger announces haspopup and expanded and links its panel', () => {
  const html = renderToStaticMarkup(h(Popover, { open: true, trigger: h('button', null, 'Info') }, 'panel'));
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="true"/);
  const id = html.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(id && html.includes(`id="${id}"`));
  assert.match(src('Popover'), /useDismiss\(visible/);
});

test('TopNavMegaMenu and MobileNav dismiss on Escape', () => {
  assert.match(src('TopNavMegaMenu'), /useDismiss\(isOpen/);
  assert.match(src('MobileNav'), /useDismiss\(open, \(\) => onClose\?\.\(\)/);
  assert.match(renderToStaticMarkup(h(TopNavMegaMenu, { trigger: 'Docs', open: true }, 'x')), /aria-controls=/);
});

test('CommandPalette hands query and onQueryChange to its input and closes on Escape', () => {
  const html = renderToStaticMarkup(h(CommandPalette, { label: 'Go', query: 'abc', onQueryChange() {} }, h(CommandPaletteInput, { label: 'Search' })));
  assert.match(html, /value="abc"/);
  assert.match(src('CommandPalette'), /e\.key === 'Escape'.*onClose/s);
  assert.match(src('CommandPaletteItem'), /onKeyDown/);
});

test('Tooltip and HoverCard can be dismissed with Escape without moving the pointer', () => {
  for (const [C, n] of [[Tooltip, 'Tooltip'], [HoverCard, 'HoverCard']]) {
    assert.match(src(n), /useDismissibleHint\(\)/);
    const html = renderToStaticMarkup(h(C, n === 'Tooltip' ? { text: 't' } : { content: 'c' }, h('button', null, 'x')));
    assert.doesNotMatch(html, /data-dismissed/);
  }
  const css = readFileSync('design/styles/primitives/tooltip.css', 'utf8') + readFileSync('design/styles/primitives/hover-card.css', 'utf8');
  assert.equal((css.match(/\[data-dismissed\]/g) || []).length, 2);
});
