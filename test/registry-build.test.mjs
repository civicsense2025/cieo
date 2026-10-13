import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../scripts/build-registry.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const ALERT_DIALOG = `import * as React from 'react';\nexport const AlertDialog = () => React.createElement('div');\n`;
const DIALOG = `import * as React from 'react';\nimport { AlertDialog } from '../AlertDialog/AlertDialog.js';\nimport { durations } from '../motion.js';\nexport const Dialog = () => React.createElement(AlertDialog, { style: { transitionDuration: durations.fast } });\n`;
const MOTION = `export const durations = { fast: 120 };\n`;

function manifest(name, dependencies) {
  const literal = dependencies.length ? `[${dependencies.map((dep) => JSON.stringify(dep)).join(', ')}]` : '[]';
  return `{\n  "name": ${JSON.stringify(name)},\n  "dependencies": ${literal}\n}\n`;
}

const EXPECTED_INDEX = {
  schemaVersion: 1,
  shared: ['motion.ts'],
  components: {
    AlertDialog: { files: ['AlertDialog/AlertDialog.tsx'], registryDependencies: [], packageImports: [], sharedFiles: [] },
    Dialog: {
      files: ['Dialog/Dialog.tsx'],
      registryDependencies: ['AlertDialog'],
      packageImports: [],
      sharedFiles: ['motion.ts'],
    },
  },
};

let seed;
test.before(() => {
  seed = mkdtempSync(join(tmpdir(), 'cieo-registry-seed-'));
  const prim = join(seed, 'src/primitives');
  mkdirSync(join(prim, 'AlertDialog'), { recursive: true });
  mkdirSync(join(prim, 'Dialog'), { recursive: true });
  writeFileSync(join(prim, 'motion.ts'), MOTION);
  writeFileSync(join(prim, 'AlertDialog/AlertDialog.tsx'), ALERT_DIALOG);
  writeFileSync(join(prim, 'Dialog/Dialog.tsx'), DIALOG);
  writeFileSync(join(prim, 'AlertDialog/manifest.json'), manifest('AlertDialog', []));
  writeFileSync(join(prim, 'Dialog/manifest.json'), manifest('Dialog', []));
});

test.after(() => rmSync(seed, { recursive: true, force: true }));

function makeTree() {
  const tree = mkdtempSync(join(tmpdir(), 'cieo-registry-tree-'));
  cpSync(seed, tree, { recursive: true });
  return tree;
}

function snapshotDir(dir) {
  const files = {};
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath ?? entry.path, entry.name);
    files[path.slice(dir.length + 1)] = readFileSync(path, 'utf8');
  }
  return files;
}

test('copies component and shared sources byte-identical, and syncs manifest dependencies', () => {
  const tree = makeTree();
  const { index, written } = buildRegistry(tree);

  assert.deepEqual(index, EXPECTED_INDEX);
  assert.deepEqual([...written].sort(), [
    'registry/AlertDialog/AlertDialog.tsx',
    'registry/Dialog/Dialog.tsx',
    'registry/index.json',
    'registry/motion.ts',
    'src/primitives/Dialog/manifest.json',
  ]);

  assert.ok(readFileSync(join(tree, 'registry/Dialog/Dialog.tsx')).equals(Buffer.from(DIALOG)));
  assert.ok(readFileSync(join(tree, 'registry/Dialog/Dialog.tsx')).equals(readFileSync(join(tree, 'src/primitives/Dialog/Dialog.tsx'))));
  assert.ok(readFileSync(join(tree, 'registry/AlertDialog/AlertDialog.tsx')).equals(Buffer.from(ALERT_DIALOG)));
  assert.ok(readFileSync(join(tree, 'registry/motion.ts')).equals(Buffer.from(MOTION)));
  assert.deepEqual(readdirSync(join(tree, 'registry/Dialog')), ['Dialog.tsx']);

  assert.equal(readFileSync(join(tree, 'registry/index.json'), 'utf8'), JSON.stringify(EXPECTED_INDEX, null, 2) + '\n');
  assert.equal(readFileSync(join(tree, 'src/primitives/Dialog/manifest.json'), 'utf8'), manifest('Dialog', ['AlertDialog']));
  assert.equal(readFileSync(join(tree, 'src/primitives/AlertDialog/manifest.json'), 'utf8'), manifest('AlertDialog', []));
});

test('generation is deterministic across two runs', () => {
  const tree = makeTree();
  buildRegistry(tree);
  const first = snapshotDir(join(tree, 'registry'));

  const second = buildRegistry(tree);
  assert.deepEqual(second.written, []);
  assert.deepEqual(snapshotDir(join(tree, 'registry')), first);
  assert.deepEqual(second.index, EXPECTED_INDEX);
});

test('--check reports a manifest whose dependencies disagree with the scan', () => {
  const tree = makeTree();
  buildRegistry(tree);
  writeFileSync(join(tree, 'src/primitives/Dialog/manifest.json'), manifest('Dialog', []));

  const result = buildRegistry(tree, { check: true });
  assert.deepEqual(result.diffs, ['src/primitives/Dialog/manifest.json']);
  assert.deepEqual(result.written, []);
  assert.deepEqual(result.index, EXPECTED_INDEX);
  assert.equal(readFileSync(join(tree, 'src/primitives/Dialog/manifest.json'), 'utf8'), manifest('Dialog', []));
});

test('--check reports a tampered registry copy', () => {
  const tree = makeTree();
  buildRegistry(tree);
  writeFileSync(join(tree, 'registry/Dialog/Dialog.tsx'), 'export const Dialog = null;\n');

  const result = buildRegistry(tree, { check: true });
  assert.deepEqual(result.diffs, ['registry/Dialog/Dialog.tsx']);
});

test('the CLI --check exits 0 clean and 1 on drift', () => {
  const tree = makeTree();
  buildRegistry(tree);
  mkdirSync(join(tree, 'scripts/lib'), { recursive: true });
  cpSync(join(repoRoot, 'scripts/build-registry.mjs'), join(tree, 'scripts/build-registry.mjs'));
  cpSync(join(repoRoot, 'scripts/lib/registry.mjs'), join(tree, 'scripts/lib/registry.mjs'));

  const clean = spawnSync(process.execPath, [join(tree, 'scripts/build-registry.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stdout, /registry: clean/);

  writeFileSync(join(tree, 'registry/Dialog/Dialog.tsx'), 'export const Dialog = null;\n');
  const dirty = spawnSync(process.execPath, [join(tree, 'scripts/build-registry.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(dirty.status, 1);
  assert.match(dirty.stderr, /stale: registry\/Dialog\/Dialog\.tsx/);
});

test('the real repository registry is in parity with its sources', () => {
  assert.ok(existsSync(join(repoRoot, 'registry/index.json')), 'run node scripts/build-registry.mjs first');
  const result = buildRegistry(repoRoot, { check: true });
  assert.deepEqual(result.diffs, []);
  assert.deepEqual(result.written, []);
});
