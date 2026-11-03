// scripts/check-css-vars.mjs — every var(--cieo-*) must resolve to a declared custom property.
// A misspelled token fails silently in CSS (the fallback, or nothing, wins), so CI fails instead.
// Declarations count from any scanned file: `--cieo-x:` in CSS, or a '--cieo-x' key in TS/JS style objects.
import { readdirSync, readFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const roots = ['design', 'src', 'tokens'];
const exts = ['.css', '.ts', '.tsx', '.js', '.mjs'];
const files = [];
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p); }
    else if (exts.some((x) => p.endsWith(x))) files.push(p);
  }
}
for (const r of roots) walk(`${root}/${r}`);
const defined = new Set();
const uses = [];
for (const p of files) {
  const text = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  for (const m of text.matchAll(/(--cieo-[\w-]+)\s*:/g)) defined.add(m[1]);
  for (const m of text.matchAll(/['"`](--cieo-[\w-]+)['"`]\s*[:,\]]/g)) defined.add(m[1]);
  for (const m of text.matchAll(/var\(\s*(--cieo-[\w-]+)/g)) uses.push([p, text.slice(0, m.index).split('\n').length, m[1]]);
}
// Tokens generated at runtime by createTheme are declared through the generator's put() calls.
for (const m of readFileSync(`${root}/design/foundations.js`, 'utf8').matchAll(/put\(`?'?([\w-]+)/g)) defined.add(`--cieo-${m[1]}`);
// Documented consumer override hooks: intentionally never declared by Cieo, always used with a fallback
// that reads a theme token. Keep this list short; a new hook needs a fallback and a line here.
const HOOKS = [/^--cieo-control-/, /^--cieo-popover-(border|radius|background|color|padding|shadow)$/,
  /^--cieo-search-(width|radius)$/, /^--cieo-(radius|field-height|focus-ring)$/, /^--cieo-i$/];
let failures = 0;
for (const [p, line, name] of uses) {
  if (defined.has(name) || HOOKS.some((h) => h.test(name))) continue;
  console.error(`${p.slice(root.length + 1)}:${line}: undefined ${name}`);
  failures += 1;
}
if (failures) { console.error(`${failures} undefined --cieo-* reference(s)`); process.exit(1); }
console.log(`css vars: ${uses.length} references, all defined`);
