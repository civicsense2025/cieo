#!/usr/bin/env node
// Adds a `layer` facet (foundation | atom | molecule | organism) to every recipe in atoms/web/index.json.
// Category stays the context (Email, Commerce…); layer says how much the recipe composes, from its markup:
//   foundation  the Foundations category (motion principles, not UI)
//   atom        at most one interactive element and eight elements (a single control, indicator or text effect)
//   molecule    a small unit of parts (the default when init() generates the markup)
//   organism    seven or more interactive elements, or sixty or more elements: a section or screen
// A recipe the heuristic misreads sets `layerOverride` in index.json.
// Usage: node scripts/catalogue/classify-layers.mjs [--check]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url).pathname;
const check = process.argv.includes('--check');
const LAYERS = ['foundation', 'atom', 'molecule', 'organism'];

// Evaluate only the atom({...}) registrations; init() bodies never run.
const found = new Map();
const stub = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => stub, construct: () => stub });
const scope = new Proxy({ atom: (o) => found.set(o.id, o), String, Math, JSON, Array, Object, Number, Symbol, Map, Set, Date },
  { has: () => true, get: (t, k) => (k in t ? t[k] : k === Symbol.unscopables ? undefined : stub), set: () => true });
const ctx = vm.createContext({ scope });
const sources = ['blocks', 'identity'].flatMap((d) => readdirSync(`${root}atoms/web/${d}`).filter((f) => f.endsWith('.js')).sort().map((f) => `${root}atoms/web/${d}/${f}`));
for (const file of sources) {
  const src = readFileSync(file, 'utf8');
  // Top-level code only registers recipes and defines helpers; stubs absorb any runtime reference.
  try { vm.runInContext(`with (scope) { ${src} }`, ctx, { timeout: 500 }); } catch { /* registrations before the throw still count */ }
}

const INTERACTIVE = /<(button|input|select|textarea|a\s[^>]*href)\b|role=["'](button|switch|slider|tab|checkbox|radio|option|menuitem)["']/g;
export function layerOf(recipe, atomDef) {
  if (recipe.category === 'Foundations') return 'foundation';
  const html = typeof atomDef?.html === 'string' ? atomDef.html : '';
  const controls = (html.match(INTERACTIVE) || []).length;
  const tags = (html.match(/<[a-z]/gi) || []).length;
  if (tags < 3) return 'molecule'; // markup is generated in init(); the common case, until overridden
  if (controls >= 7 || tags >= 60) return 'organism';
  if (controls <= 1 && tags <= 8) return 'atom';
  return 'molecule';
}

const path = `${root}atoms/web/index.json`;
const text = readFileSync(path, 'utf8');
const index = JSON.parse(text);
const counts = Object.fromEntries(LAYERS.map((l) => [l, 0]));
for (const r of index) {
  const layer = r.layerOverride ?? layerOf(r, found.get(r.id));
  r.layer = layer; counts[layer] += 1;
}
const out = JSON.stringify(index, null, 1) + '\n';
if (check) {
  if (out !== text) { console.error('atoms/web/index.json layers are stale: run node scripts/catalogue/classify-layers.mjs'); process.exit(1); }
} else writeFileSync(path, out);
console.log(`layers: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')} (${found.size} of ${index.length} recipes read from markup)`);
