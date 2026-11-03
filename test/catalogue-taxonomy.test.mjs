// The recipe catalogue's facets: every category sits in exactly one library group, every recipe has a layer,
// and no two recipes share a display name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const index = JSON.parse(readFileSync(new URL('../atoms/web/index.json', import.meta.url), 'utf8'));
const model = readFileSync(new URL('../atoms/web/library/ui/model.js', import.meta.url), 'utf8');
const groups = model.slice(model.lastIndexOf('L.categoryGroups = {'));
const grouped = [...groups.slice(0, groups.indexOf('};')).matchAll(/'([^']+)'(?=[,\]])/g)].map((m) => m[1]);

test('every recipe category belongs to exactly one library group', () => {
  for (const c of new Set(index.map((r) => r.category))) assert.equal(grouped.filter((g) => g === c).length, 1, c);
});

test('every recipe has a layer facet, and the stored layers are current', () => {
  for (const r of index) assert.ok(['foundation', 'atom', 'molecule', 'organism'].includes(r.layer), r.id);
  execFileSync(process.execPath, [new URL('../scripts/catalogue/classify-layers.mjs', import.meta.url).pathname, '--check']);
});

test('recipe display names are unique', () => {
  const seen = new Map();
  for (const r of index) { assert.ok(!seen.has(r.name), `${r.id} and ${seen.get(r.name)} are both "${r.name}"`); seen.set(r.name, r.id); }
});
