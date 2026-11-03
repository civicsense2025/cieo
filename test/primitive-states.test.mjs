// Interaction-state baseline for design/styles/primitives: hover never sticks on touch, and focus rings and
// disabled states read their tokens instead of literals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const dir = new URL('../design/styles/primitives/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => [f, readFileSync(new URL(f, dir), 'utf8')]);

test('hover-only styles sit inside @media (hover: hover)', () => {
  const bad = [];
  for (const [f, css] of files) {
    css.split('\n').forEach((line, i) => {
      // Disclosure (tooltips, hover cards, submenus) also opens on focus, so it may stay unguarded.
      if (line.includes(':hover') && !line.includes('(hover: hover)') && !/focus-(within|visible)/.test(line)) bad.push(`${f}:${i + 1}`);
    });
  }
  assert.deepEqual(bad, []);
});

test('focus rings use --cieo-focus-width and --cieo-color-focus', () => {
  const bad = [];
  for (const [f, css] of files) {
    for (const m of css.matchAll(/outline:\s*(\d+px)\s+\w+\s+var\(--cieo-color-[\w-]+\)/g)) bad.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(bad, []);
});

test('disabled opacity reads --cieo-disabled-opacity', () => {
  const bad = [];
  for (const [f, css] of files) {
    for (const m of css.matchAll(/:disabled[^{]*\{[^}]*opacity:\s*(0?\.\d+)/g)) bad.push(`${f}: opacity ${m[1]}`);
  }
  assert.deepEqual(bad, []);
});
