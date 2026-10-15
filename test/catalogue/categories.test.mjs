import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const blocks = path.join(root, 'atoms/web/blocks');
const page = fs.readFileSync(path.join(root, 'atoms/web/runtime.library.page.js'), 'utf8');

const declared = (() => {
  const line = page.split('\n').find(l => l.startsWith('const CATS = ['));
  assert.ok(line, 'runtime.library.page.js declares CATS');
  return new Set(JSON.parse(line.replace('const CATS =', '').replace(/;\s*$/, '').replace(/'/g, '"')));
})();

// A tile whose category has no section throws while the page builds its tiles,
// which stops every tile after it and every motion loop from starting.
test('every atom category has a section on the catalogue page', () => {
  const used = new Map();
  for (const file of fs.readdirSync(blocks).filter(f => f.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(blocks, file), 'utf8');
    for (const [, id, cat] of source.matchAll(/atom\(\s*\{\s*id:\s*'([^']+)',\s*cat:\s*'([^']+)'/g)) {
      if (!declared.has(cat)) used.set(cat, [...(used.get(cat) ?? []), id]);
    }
  }
  assert.deepEqual(Object.fromEntries(used), {}, 'categories used by atoms but missing from CATS');
});

test('every page category is placed in a jump-menu group', () => {
  const groups = page.match(/const CATGROUPS = \{[\s\S]*?\};/)[0];
  const placed = new Set([...groups.matchAll(/'([^']+)'/g)].map(m => m[1]));
  const orphaned = [...declared].filter(c => !placed.has(c));
  // Orphans fall into an automatic "More" group; list them so a new category is a conscious choice.
  assert.deepEqual(orphaned, [], 'categories that would land in the catch-all More group');
});
