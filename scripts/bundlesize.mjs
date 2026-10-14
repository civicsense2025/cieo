#!/usr/bin/env node
// scripts/bundlesize.mjs — delivery budget gate (node built-ins only).
// Fails (exit 1) when a canonical payload exceeds its recorded budget.
// Budgets = measured 2026-10-14 baseline +10%, rounded up:
//
//   dist/primitives (non-min)   181745 -> budget 199920
//   dist total (non-min)         330120 -> budget 363132
//   docs/catalogue.html         3175205 -> budget 3492726
//   docs/collection.html        3227087 -> budget 3549796
//   docs/library.html           3175205 -> budget 3492726
//   docs/workbench.html         3243715 -> budget 3568087
//
// Derived *.min.js / *.min.css files are EXCLUDED from the canonical totals
// (they are byte-functions of the sources) and reported as INFO rows with
// the minified ratio instead. Run: npm run check:size
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUDGETS = [
  { label: 'dist/primitives', kind: 'dir', path: 'dist/primitives', exclude: /\.min\.(js|css)$/, budget: 199920 },
  { label: 'dist total', kind: 'dir', path: 'dist', exclude: /\.min\.(js|css)$/, budget: 363132 },
  { label: 'docs/catalogue.html', kind: 'file', path: 'docs/catalogue.html', budget: 3492726 },
  { label: 'docs/collection.html', kind: 'file', path: 'docs/collection.html', budget: 3549796 },
  { label: 'docs/library.html', kind: 'file', path: 'docs/library.html', budget: 3492726 },
  { label: 'docs/workbench.html', kind: 'file', path: 'docs/workbench.html', budget: 3568087 },
];

function dirSize(dir, exclude) {
  let total = 0;
  let files = 0;
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (exclude && exclude.test(p)) continue;
      total += statSync(p).size;
      files += 1;
    }
  };
  walk(dir);
  return { total, files };
}

let failures = 0;
const rows = [];
for (const b of BUDGETS) {
  const full = join(root, b.path);
  if (!existsSync(full)) {
    console.error(`BUDGET MISSING ${b.label} (${b.path} not found)`);
    failures += 1;
    continue;
  }
  const size = b.kind === 'dir' ? dirSize(full, b.exclude).total : statSync(full).size;
  const ok = size <= b.budget;
  if (!ok) failures += 1;
  rows.push(`${ok ? 'PASS' : 'FAIL'} ${b.label} ${size} <= ${b.budget} (${(100 * size / b.budget).toFixed(1)}% of budget)`);
}

// INFO (no gate): derived minified payloads.
const info = [];
{
  const js = { total: 0, min: 0 };
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!p.endsWith('.js')) continue;
      if (p.endsWith('.min.js')) js.min += statSync(p).size;
      else js.total += statSync(p).size;
    }
  };
  const distDir = join(root, 'dist');
  if (existsSync(distDir)) {
    walk(distDir);
    info.push(`INFO dist js ${js.total} -> min ${js.min} (${(100 * js.min / js.total).toFixed(1)}% of orig)`);
  }
  const full = join(root, 'dist/controls/controls.css');
  const minp = join(root, 'dist/controls/controls.min.css');
  if (existsSync(full) && existsSync(minp)) {
    const a = statSync(full).size;
    const m = statSync(minp).size;
    info.push(`INFO controls.css ${a} -> min ${m} (${(100 * m / a).toFixed(1)}% of orig)`);
  }
}

console.log(['bundlesize:', ...rows, ...info].join('\n'));
if (failures) {
  console.error(`bundlesize: ${failures} budget(s) exceeded`);
  process.exitCode = 1;
} else console.log('bundlesize: all budgets hold');
