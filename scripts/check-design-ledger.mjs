#!/usr/bin/env node
// Counts describe source-backed changes, not performance measurements or theme permutations.
import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTheme } from '../design/index.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ledger = JSON.parse(readFileSync(resolve(root, 'docs/improvements.json'), 'utf8'));
const tokens = createTheme().tokens, ids = new Set(), descriptions = new Set();
if (ledger.count !== ledger.entries.length || ledger.count < 200 || ledger.count > 500) throw new Error('Expected 200–500 enumerated changes.');
for (const [index, item] of ledger.entries.entries()) {
  if (item.id !== `CIEO-${String(index + 1).padStart(3, '0')}` || ids.has(item.id)) throw new Error(`Invalid ID: ${item.id}`);
  ids.add(item.id);
  if (descriptions.has(item.improvement)) throw new Error(`Duplicate change: ${item.id}`);
  descriptions.add(item.improvement);
  const path = resolve(root, item.path);
  if (!path.startsWith(root + sep)) throw new Error('Ledger path escaped the repository.');
  const source = readFileSync(path, 'utf8');
  if (item.token ? !Object.hasOwn(tokens, item.token) : typeof item.anchor !== 'string' || !source.includes(item.anchor)) throw new Error(`Missing source contract: ${item.id}`);
}
console.log(`ledger: ${ledger.count} source-mapped improvements (${ledger.entries.filter((item) => item.token).length} token roles)`);
