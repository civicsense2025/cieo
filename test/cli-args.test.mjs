import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, UsageError } from '../cli/lib/args.mjs';
import { packageRoot, projectRoot } from '../cli/lib/paths.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const bin = join(root, 'bin/cieo.mjs');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function runCli(args, cwd = root) {
  return spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' });
}

test('parseArgs collects boolean flags, value flags, and positionals', () => {
  const spec = { overwrite: 'boolean', target: 'value', alias: 'value' };
  assert.deepEqual(parseArgs(['add', 'Dialog', '--overwrite'], spec), {
    flags: { overwrite: true },
    positionals: ['add', 'Dialog'],
  });
  assert.deepEqual(parseArgs(['--target', 'next'], spec).flags, { target: 'next' });
  assert.deepEqual(parseArgs(['--target=next'], spec).flags, { target: 'next' });
  assert.deepEqual(parseArgs(['--target', 'next', '--target=vite'], spec).flags, { target: 'vite' });
  assert.deepEqual(parseArgs(['--target='], spec).flags, { target: '' });
  assert.deepEqual(parseArgs(['--alias=@/cieo'], spec).flags, { alias: '@/cieo' });
  assert.deepEqual(parseArgs([], spec), { flags: {}, positionals: [] });
});

test('parseArgs treats everything after -- as positional', () => {
  const spec = { overwrite: 'boolean' };
  assert.deepEqual(parseArgs(['--', '--overwrite', '-x'], spec), {
    flags: {},
    positionals: ['--overwrite', '-x'],
  });
  assert.deepEqual(parseArgs(['add', '--', 'Dialog', '--overwrite'], spec), {
    flags: {},
    positionals: ['add', 'Dialog', '--overwrite'],
  });
  assert.deepEqual(parseArgs(['-'], spec).positionals, ['-']);
});

test('parseArgs rejects unknown flags and malformed values with UsageError', () => {
  const spec = { overwrite: 'boolean', target: 'value' };
  assert.throws(() => parseArgs(['--nope'], spec), UsageError);
  assert.throws(() => parseArgs(['--nope=1'], spec), UsageError);
  assert.throws(() => parseArgs(['-x'], spec), UsageError);
  assert.throws(() => parseArgs(['--overwrite=yes'], spec), UsageError);
  assert.throws(() => parseArgs(['--target'], spec), UsageError);
  assert.throws(() => parseArgs(['--target', '--'], spec), UsageError);
});

test('packageRoot is the shipped package directory, projectRoot is the working directory', () => {
  assert.equal(packageRoot(), root);
  assert.equal(existsSync(join(packageRoot(), 'package.json')), true);
  assert.equal(existsSync(join(packageRoot(), 'registry/index.json')), true);
  assert.equal(projectRoot(), process.cwd());
});

test('cieo --version prints the package version and exits 0', () => {
  const result = runCli(['--version']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), pkg.version);
  assert.equal(result.stderr, '');
});

test('cieo --version reads its own package.json even when cwd is elsewhere', () => {
  const elsewhere = mkdtempSync(join(tmpdir(), 'cieo-cwd-'));
  try {
    const result = runCli(['--version'], elsewhere);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), pkg.version);
  } finally {
    rmSync(elsewhere, { recursive: true, force: true });
  }
});

test('cieo --help exits 0, lists every command, and never loads command modules', () => {
  const result = runCli(['--help']);
  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  for (const command of ['init', 'add', 'list', 'diff', 'theme', 'doctor']) {
    assert.match(result.stdout, new RegExp(`^\\s*${command}\\s`, 'm'));
  }

  const tree = mkdtempSync(join(tmpdir(), 'cieo-lazy-'));
  try {
    cpSync(join(root, 'bin'), join(tree, 'bin'), { recursive: true });
    cpSync(join(root, 'cli/lib'), join(tree, 'cli/lib'), { recursive: true });
    cpSync(join(root, 'package.json'), join(tree, 'package.json'));
    mkdirSync(join(tree, 'cli/commands'), { recursive: true });
    writeFileSync(join(tree, 'cli/commands/init.mjs'), "process.stderr.write('init module loaded\\n'); process.exit(99);\n");
    for (const flag of ['--help', '--version']) {
      const lazy = spawnSync(process.execPath, [join(tree, 'bin/cieo.mjs'), flag], { encoding: 'utf8' });
      assert.equal(lazy.status, 0, `${flag} must not load command modules`);
      assert.equal(lazy.stderr, '');
    }
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test('cieo with no arguments prints help and exits 0', () => {
  const result = runCli([]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.equal(result.stderr, '');
});

test('an unknown command exits 2 with a plain message on stderr', () => {
  const result = runCli(['wat']);
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, "Unknown command 'wat'\n");
});

test('the committed entrypoint starts with a shebang and is executable', () => {
  assert.ok(readFileSync(bin, 'utf8').startsWith('#!/usr/bin/env node\n'));
  assert.ok((statSync(bin).mode & 0o111) !== 0, 'bin/cieo.mjs must be executable');
});
