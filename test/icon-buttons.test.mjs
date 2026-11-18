import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Generic actions (copy, close, reset, search, show/hide) are icons with an accessible name, never a word on the button.
const iconOnly = (html, id) => {
  const m = new RegExp(`<button[^>]*id="${id}"[^>]*>([\\s\\S]*?)</button>`).exec(html);
  assert.ok(m, `${id} exists`);
  assert.match(m[0], /aria-label="[^"]+"/, `${id} keeps an accessible name`);
  assert.match(m[1], /^<svg[\s\S]*<\/svg>$/, `${id} shows only an icon`);
};

test('the Studio actions are icon buttons', () => {
  const html = readFileSync('docs/studio/index.html', 'utf8');
  for (const id of ['share', 'reset', 'copy', 'download', 'apply-accent']) iconOnly(html, id);
});

test('the site search and menu buttons are icons', () => {
  const chrome = readFileSync('scripts/lib/site-chrome.mjs', 'utf8');
  assert.doesNotMatch(chrome, /<span>Search<\/span>/);
  assert.match(chrome, /class="site-menu-btn"[^>]*aria-label="Menu"/);
});

test('the dialog close button and the password toggle draw icons, with their names kept for screen readers', () => {
  const dialog = readFileSync('src/primitives/DialogHeader/DialogHeader.tsx', 'utf8');
  assert.match(dialog, /aria-label=\{closeLabel\}[^>]*>\s*<svg/);
  const password = readFileSync('src/primitives/AuthPasswordInput/AuthPasswordInput.tsx', 'utf8');
  assert.match(password, /aria-label=\{shown \? 'Hide password' : 'Show password'\}/);
  assert.doesNotMatch(password, /AuthSwapText value=\{shown/);
});
