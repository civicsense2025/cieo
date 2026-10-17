#!/usr/bin/env node
// scripts/bundlesize.mjs — delivery budget gate (node built-ins only).
// Fails (exit 1) when a canonical payload exceeds its recorded budget.
// Budgets = pre-PR origin/main (f26451b) git-blob sizes +10%, rounded up
// (verified: primitives 181745, dist total 330120, catalogue 3175205,
// collection 3227087, library 3175205, workbench 3243715):
//
//   dist/primitives (non-min)   181745 -> budget 199920
//   dist total (non-min)         330120 -> budget 363132
//   docs/catalogue.html         3175205 -> budget 3492726
//   docs/collection.html        3227087 -> budget 3549796
//   docs/library.html           3175205 -> budget 3492726
//   docs/workbench.html         3243715 -> budget 3568087
//
// NOTE (honest framing): derived *.min.js / *.min.css are sidecars, NOT
// served — no package.json exports entry points at them yet, so the "-32%"
// is disk savings only until a minified delivery graph is wired (follow-up).
// They are EXCLUDED from the canonical totals (byte-functions of sources)
// and reported as INFO rows with the minified ratio instead.
// Current dist total sits near 98% of budget: follow-up growth must cut or
// justify. Run: npm run check:size
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENT_COMPONENTS = ['AgentActivity', 'AgentIcon', 'AgentLanes', 'AgentStatus', 'ApprovalRequest', 'RunControls', 'StreamingMessage', 'ToolCallDisclosure'];
const BUDGETS = [
  { label: 'dist/primitives', kind: 'dir', path: 'dist/primitives', exclude: /\.min\.(js|css)$/, budget: 199920 },
  // The agent components sit inside dist/primitives and also carry their own row (measured 15876 at introduction
  // +10%), so their growth is visible on its own instead of eating the shared headroom unnoticed.
  { label: 'dist/primitives agent components', kind: 'dirs', path: 'dist/primitives', dirs: AGENT_COMPONENTS, exclude: /\.min\.(js|css)$/, budget: 17464 },
  // dist/agent carries its own budget (measured 32968 at introduction +10%); dist total grows by exactly that.
  { label: 'dist/agent', kind: 'dir', path: 'dist/agent', exclude: /(\.min\.(js|css)|\/icons\.(js|d\.ts))$/, budget: 36265 },
  // Agent icon data is generated from the icon atom (measured 17632 at introduction +10%).
  { label: 'dist/agent icons', kind: 'files', path: 'dist/agent', files: ['icons.js', 'icons.d.ts'], budget: 19396 },
  // dist total grows by exactly the agent component and icon budgets above.
  { label: 'dist total', kind: 'dir', path: 'dist', exclude: /\.min\.(js|css)$/, budget: 436257 },
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
  const size = b.kind === 'dir' ? dirSize(full, b.exclude).total
    : b.kind === 'dirs' ? b.dirs.reduce((sum, d) => sum + dirSize(join(full, d), b.exclude).total, 0)
    : b.kind === 'files' ? b.files.reduce((sum, f) => sum + statSync(join(full, f)).size, 0)
    : statSync(full).size;
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
