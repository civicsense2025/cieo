// Every browser module under site/ must import only names its target really exports.
// A missing export kills the whole module at load time in the browser, so this catches it without one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function listJs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listJs(p) : p.endsWith('.js') ? [p] : [];
  });
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

/** Named imports and re-exports: [{ names, spec }]. `default`/namespace forms are recorded as needing only the module. */
function importsOf(src) {
  const out = [];
  const re = /(?:^|[\n;])\s*(?:import|export)\s+(?:type\s+)?([\w$*\s,{}]+?)\s+from\s+['"]([^'"]+)['"]/g;
  for (const m of stripComments(src).matchAll(re)) {
    const clause = m[1];
    const braces = clause.match(/\{([^}]*)\}/);
    const names = braces ? braces[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]).filter(Boolean) : [];
    if (/^\s*[\w$]+\s*(,|$)/.test(clause) && !clause.trim().startsWith('{') && !clause.trim().startsWith('*')) names.push('default');
    out.push({ names, spec: m[2] });
  }
  for (const m of stripComments(src).matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push({ names: [], spec: m[1] });
  for (const m of stripComments(src).matchAll(/(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g)) out.push({ names: [], spec: m[1] });
  return out;
}

/** Static export names of a site module (no execution: pages touch the DOM on load). */
function staticExports(src) {
  const names = new Set();
  const s = stripComments(src);
  for (const m of s.matchAll(/export\s+(?:async\s+)?(?:function\*?|class|const|let|var)\s+([\w$]+)/g)) names.add(m[1]);
  for (const m of s.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) { const n = part.trim().split(/\s+as\s+/).pop(); if (n) names.add(n); }
  }
  if (/export\s+default\b/.test(s)) names.add('default');
  return names;
}

test('every site/**/*.js import resolves to a real export', async () => {
  const failures = [];
  const cache = new Map();
  for (const file of listJs(join(root, 'site'))) {
    const here = relative(root, file);
    for (const { names, spec } of importsOf(readFileSync(file, 'utf8'))) {
      if (!spec.startsWith('.')) continue;
      const target = resolve(dirname(file), spec);
      if (!existsSync(target)) { failures.push(`${here}: '${spec}' does not exist`); continue; }
      if (!names.length) continue;
      let exported = cache.get(target);
      if (!exported) {
        if (relative(join(root, 'site'), target).startsWith('..')) exported = new Set(Object.keys(await import(pathToFileURL(target).href)));
        else exported = staticExports(readFileSync(target, 'utf8'));
        cache.set(target, exported);
      }
      for (const n of names) if (!exported.has(n)) failures.push(`${here}: '${spec}' does not export '${n}'`);
    }
  }
  assert.deepEqual(failures, []);
});
