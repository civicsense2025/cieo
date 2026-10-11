// scripts/check-motion-tokens.mjs — no raw durations outside token fallbacks.
// Scans primitive CSS/tsx for 12ms / 0.8s style literals, except inside
// var(--motion-…) fallbacks and comments. Non-time units (px, deg, rem) never match.
import { readdirSync, readFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
function stripTokenFallbacks(s) {
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/var\(--motion-[\w-]+\s*,\s*[^()]*\)/g, 'var(--motion-x)');
  }
  return s;
}
let failures = 0;
function scan(path, text) {
  const clean = stripTokenFallbacks(stripComments(text));
  for (const m of clean.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(ms|s)\b/g)) {
    const line = clean.slice(0, m.index).split('\n').length;
    console.error(`${path}:${line}: raw duration ${m[0]}`);
    failures += 1;
  }
}
function walk(dir, exts) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, exts);
    else if (exts.some((x) => p.endsWith(x))) scan(p, readFileSync(p, 'utf8'));
  }
}
walk(`${root}/design/styles/primitives`, ['.css']);
walk(`${root}/src/primitives`, ['.css', '.tsx']);
if (failures) process.exit(1);
console.log('motion tokens: clean');
