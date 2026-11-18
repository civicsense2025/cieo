import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Primitive stylesheets style a root as `:where(.cieo).cieo-xxx`, so hand-written markup must carry both classes or the
// component renders unstyled (a calendar header jammed into one line, for example).
const sheets = ['design/styles', 'design/styles/primitives'].flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.css')).map((f) => readFileSync(`${d}/${f}`, 'utf8')));
const roots = new Set(sheets.flatMap((css) => [...css.matchAll(/:where\(\.cieo\)\.([\w-]+)/g)].map((m) => m[1])));

for (const file of readdirSync('site/composites').filter((f) => f.endsWith('.html'))) {
  test(`${file}: every component root also carries the cieo class`, () => {
    const html = readFileSync(`site/composites/${file}`, 'utf8');
    const bad = [...html.matchAll(/\bclass="([^"]*)"/g)].map((m) => m[1].split(/\s+/)).filter((c) => !c.includes('cieo') && c.some((x) => roots.has(x)));
    assert.deepEqual(bad.slice(0, 5), []);
  });
}
