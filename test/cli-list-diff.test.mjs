import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import list, { USAGE as LIST_USAGE, marker } from '../cli/commands/list.mjs';
import diff, { USAGE as DIFF_USAGE, alignedDiff } from '../cli/commands/diff.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const bin = join(root, 'bin', 'cieo.mjs');
const registry = JSON.parse(readFileSync(join(root, 'registry', 'index.json'), 'utf8'));
const TOTAL = Object.keys(registry.components).length;

const CONFIG = { version: 1, target: 'vite', componentsDir: 'src/components/cieo', theme: {} };

function makeProject(config = CONFIG) {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-list-diff-'));
  writeFileSync(join(dir, 'cieo.json'), `${JSON.stringify(config, null, 2)}\n`);
  return dir;
}

function runCli(args, cwd) {
  return spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' });
}

function componentPath(dir, rel) {
  return join(dir, CONFIG.componentsDir, rel);
}

function addDialog(dir) {
  const result = runCli(['add', 'dialog'], dir);
  assert.equal(result.status, 0, result.stderr);
}

test('list and diff are exported commands with usage text', () => {
  assert.equal(typeof list, 'function');
  assert.equal(typeof diff, 'function');
  assert.match(LIST_USAGE, /cieo list/);
  assert.match(DIFF_USAGE, /cieo diff <id>/);
});

test('list without cieo.json names the exact init command and exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-list-diff-'));
  try {
    const result = runCli(['list'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /npx cieo init/);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('list refuses an html target with the React-project message and exits 1', () => {
  const dir = makeProject({ ...CONFIG, target: 'html' });
  try {
    const result = runCli(['list'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /components need a React project \(target next\/vite\)/);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('list on a fresh project blanks every component and counts zero copied', () => {
  const dir = makeProject();
  try {
    const result = runCli(['list'], dir);
    assert.equal(result.status, 0, result.stderr);
    const lines = result.stdout.replace(/\n$/, '').split('\n');
    assert.equal(lines[0], `Components in src/components/cieo (0 of ${TOTAL} copied)`);
    assert.equal(lines.length, TOTAL + 1);
    for (const line of lines.slice(1)) assert.match(line, /^ {2}\S/);
    assert.doesNotMatch(result.stdout, /[✓~]/);
    assert.deepEqual(readdirSync(dir), ['cieo.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('list marks a component copied only when all of its own files are present', () => {
  const dir = makeProject();
  try {
    addDialog(dir);
    const copied = runCli(['list'], dir);
    assert.equal(copied.status, 0, copied.stderr);
    assert.match(copied.stdout, new RegExp(`^Components in src/components/cieo \\(2 of ${TOTAL} copied\\)$`, 'm'));
    assert.match(copied.stdout, /^✓ Dialog$/m);
    assert.match(copied.stdout, /^✓ Overlay$/m);
    assert.match(copied.stdout, /^ {2}Badge$/m);

    rmSync(componentPath(dir, 'Overlay/Overlay.tsx'));
    const partial = runCli(['list'], dir);
    assert.equal(partial.status, 0, partial.stderr);
    assert.match(partial.stdout, new RegExp(`^Components in src/components/cieo \\(1 of ${TOTAL} copied\\)$`, 'm'));
    assert.match(partial.stdout, /^ {2}Overlay$/m);
    assert.match(partial.stdout, /^✓ Dialog$/m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('marker maps none, some, and all files onto blank, tilde, and check', () => {
  assert.equal(marker(0, 2), ' ');
  assert.equal(marker(1, 2), '~');
  assert.equal(marker(2, 2), '✓');
  assert.equal(marker(0, 1), ' ');
  assert.equal(marker(1, 1), '✓');
  for (const [id, entry] of Object.entries(registry.components)) {
    assert.equal(entry.files.length, 1, `${id} now owns ${entry.files.length} files — add a CLI test for the tilde branch`);
  }
});

test('list rejects a stray argument as a usage error', () => {
  const dir = makeProject();
  try {
    const result = runCli(['list', 'dialog'], dir);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /cieo list/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff without cieo.json names the exact init command and exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-list-diff-'));
  try {
    const result = runCli(['diff', 'dialog'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /npx cieo init/);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff refuses an html target with the React-project message and exits 1', () => {
  const dir = makeProject({ ...CONFIG, target: 'html' });
  try {
    const result = runCli(['diff', 'dialog'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /components need a React project \(target next\/vite\)/);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff without an id is a usage error that shows the usage line', () => {
  const dir = makeProject();
  try {
    const result = runCli(['diff'], dir);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /cieo diff <id>/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff with an unknown id exits 1 with suggestions and writes nothing', () => {
  const dir = makeProject();
  try {
    const result = runCli(['diff', 'dialogg'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown component 'dialogg'/);
    assert.match(result.stderr, /Did you mean: .*Dialog/);
    assert.deepEqual(readdirSync(dir), ['cieo.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff reports every missing file in plan order and exits 1 without writing', () => {
  const dir = makeProject();
  try {
    const result = runCli(['diff', 'dialog'], dir);
    assert.equal(result.status, 1);
    assert.equal(
      result.stdout,
      'Overlay/Overlay.tsx: missing\nDialog/Dialog.tsx: missing\ncustomization.ts: missing\nparts.ts: missing\nmotion.ts: missing\n',
    );
    assert.deepEqual(readdirSync(dir), ['cieo.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff on a pristine copy is silent and exits 0', () => {
  const dir = makeProject();
  try {
    addDialog(dir);
    const result = runCli(['diff', 'dialog'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff prints the changed line as an aligned - expected / + actual pair and exits 1', () => {
  const dir = makeProject();
  try {
    addDialog(dir);
    const file = componentPath(dir, 'Dialog/Dialog.tsx');
    const pristine = readFileSync(file, 'utf8');
    const edited = pristine.replace('cieo-dialog', 'cieo-dialog-local');
    writeFileSync(file, edited);

    const result = runCli(['diff', 'dialog'], dir);
    assert.equal(result.status, 1);
    const expectedLine = pristine.split('\n').find((line) => line.includes('cieo-dialog'));
    const actualLine = edited.split('\n').find((line) => line.includes('cieo-dialog-local'));
    assert.equal(result.stdout, `Dialog/Dialog.tsx:\n- ${expectedLine}\n+ ${actualLine}\n`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff reports a deleted shared file as missing and exits 1', () => {
  const dir = makeProject();
  try {
    addDialog(dir);
    rmSync(componentPath(dir, 'motion.ts'));
    const result = runCli(['diff', 'dialog'], dir);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, 'motion.ts: missing\n');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('diff prints surplus actual lines with + and surplus expected lines with -', () => {
  const dir = makeProject();
  try {
    addDialog(dir);
    const file = componentPath(dir, 'Dialog/Dialog.tsx');
    const pristine = readFileSync(file, 'utf8');

    writeFileSync(file, `${pristine}// local note\n`);
    const appended = runCli(['diff', 'dialog'], dir);
    assert.equal(appended.status, 1);
    assert.equal(appended.stdout, 'Dialog/Dialog.tsx:\n+ // local note\n');

    const lines = pristine.split('\n');
    const removed = lines.splice(lines.length - 2, 1)[0];
    writeFileSync(file, lines.join('\n'));
    const truncated = runCli(['diff', 'dialog'], dir);
    assert.equal(truncated.status, 1);
    assert.equal(truncated.stdout, `Dialog/Dialog.tsx:\n- ${removed}\n`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('alignedDiff compares index by index and prints - before + at differing indexes', () => {
  assert.deepEqual(alignedDiff('a\nb\nc\n', 'a\nB\nc\n'), ['- b', '+ B']);
  assert.deepEqual(alignedDiff('a\n', 'a\n'), []);
  assert.deepEqual(alignedDiff('a\nb\n', 'a\n'), ['- b']);
  assert.deepEqual(alignedDiff('a\n', 'a\nb\n'), ['+ b']);
  assert.deepEqual(alignedDiff('a\nb\nc\n', 'a\nc\n'), ['- b', '+ c', '- c']);
});

test('list --help and diff --help print usage without needing a config', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-list-diff-'));
  try {
    const listHelp = runCli(['list', '--help'], dir);
    assert.equal(listHelp.status, 0);
    assert.match(listHelp.stdout, /cieo list/);

    const diffHelp = runCli(['diff', '--help'], dir);
    assert.equal(diffHelp.status, 0);
    assert.match(diffHelp.stdout, /cieo diff <id>/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
