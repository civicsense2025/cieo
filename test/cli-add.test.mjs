import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import add, { USAGE } from '../cli/commands/add.mjs';
import { copyPlan } from '../cli/lib/copy.mjs';
import { assertNoPackageTerritoryImports, rewriteImports } from '../cli/lib/rewrite.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const bin = join(root, 'bin', 'cieo.mjs');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const CONFIG = { version: 1, target: 'vite', componentsDir: 'src/components/cieo', theme: {} };
const FILES = ['Overlay/Overlay.tsx', 'Dialog/Dialog.tsx', 'customization.ts', 'parts.ts', 'motion.ts'];

function makeProject(config = CONFIG) {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-add-'));
  writeFileSync(join(dir, 'cieo.json'), `${JSON.stringify(config, null, 2)}\n`);
  return dir;
}

function runAdd(args, cwd) {
  return spawnSync(process.execPath, [bin, 'add', ...args], { cwd, encoding: 'utf8' });
}

function componentPath(dir, rel) {
  return join(dir, CONFIG.componentsDir, rel);
}

function registryContent(rel) {
  return rewriteImports(readFileSync(join(root, 'registry', rel), 'utf8'), rel);
}

function editDialog(dir) {
  const file = componentPath(dir, 'Dialog/Dialog.tsx');
  const edited = readFileSync(file, 'utf8').replace('cieo-dialog', 'cieo-dialog-local');
  writeFileSync(file, edited);
  return { file, edited };
}

async function capture(stream, operation) {
  const chunks = [];
  const original = process[stream].write;
  process[stream].write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    return { result: await operation(), output: chunks.join('') };
  } finally {
    process[stream].write = original;
  }
}

function stubPrompt(answers) {
  const calls = [];
  return {
    calls,
    prompt: {
      tty: true,
      ask() {
        throw new Error('ask must not be called');
      },
      confirm() {
        throw new Error('confirm must not be called');
      },
      choose(question, options, { default: fallback }) {
        calls.push({ question, options: [...options], default: fallback });
        const answer = answers[calls.length - 1];
        return typeof answer === 'number' ? options[answer] : answer;
      },
    },
  };
}

test('add without cieo.json names the exact init command and exits 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-add-'));
  try {
    const result = runAdd(['dialog'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /npx cieo init/);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('add refuses an html target with the React-project message and exits 1', () => {
  const dir = makeProject({ ...CONFIG, target: 'html' });
  try {
    const result = runAdd(['dialog'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /components need a React project \(target next\/vite\)/);
    assert.equal(existsSync(join(dir, 'src')), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown id exits 1 with suggestions and copies nothing', () => {
  const dir = makeProject();
  try {
    const result = runAdd(['dialogg'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Did you mean: .*Dialog/);
    assert.equal(existsSync(join(dir, 'src')), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('add without an id is a usage error that shows the usage line', () => {
  const dir = makeProject();
  try {
    const result = runAdd([], dir);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /cieo add <id>/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('USAGE names the command and every flag', () => {
  assert.equal(typeof add, 'function');
  assert.match(USAGE, /cieo add <id>/);
  assert.match(USAGE, /--dry-run/);
  assert.match(USAGE, /--overwrite/);
  assert.match(USAGE, /--yes/);
});

test('add dialog copies the transitive set, rewritten, with banners preserved', () => {
  const dir = makeProject();
  try {
    const result = runAdd(['dialog'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Adding Dialog to src\/components\/cieo/);
    assert.match(result.stdout, /Dialog\/Dialog\.tsx/);
    assert.match(result.stdout, /Overlay\/Overlay\.tsx/);
    assert.match(result.stdout, /motion\.ts/);
    assert.match(result.stdout, /customization\.ts/);
    assert.match(result.stdout, /parts\.ts/);
    assert.match(result.stdout, /5 copied, 0 unchanged, 0 skipped/);
    for (const rel of FILES) {
      assert.ok(existsSync(componentPath(dir, rel)), `${rel} must be copied`);
      const installed = readFileSync(componentPath(dir, rel), 'utf8');
      assert.equal(installed, registryContent(rel));
      assertNoPackageTerritoryImports(installed, rel);
    }

    const dialog = readFileSync(componentPath(dir, 'Dialog/Dialog.tsx'), 'utf8');
    assert.equal(dialog, registryContent('Dialog/Dialog.tsx'));
    assert.ok(dialog.startsWith("'use client';\n"), "'use client' must travel with the file");
    assertNoPackageTerritoryImports(dialog, 'Dialog/Dialog.tsx');
    assert.doesNotMatch(dialog, /\.\.\/\.\.\//);
    assert.match(dialog, /from 'cieo\/react'/);
    assert.match(dialog, /from '\.\.\/Overlay\/Overlay'/);
    assert.match(dialog, /from '\.\.\/motion'/);
    assert.match(readFileSync(join(root, 'registry', 'Dialog', 'Dialog.tsx'), 'utf8'), /'\.\.\/\.\.\/react\/index\.js'/);

    const overlay = readFileSync(componentPath(dir, 'Overlay/Overlay.tsx'), 'utf8');
    assertNoPackageTerritoryImports(overlay, 'Overlay/Overlay.tsx');

    const motion = readFileSync(componentPath(dir, 'motion.ts'), 'utf8');
    assert.equal(motion, readFileSync(join(root, 'registry', 'motion.ts'), 'utf8'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('add copies and rewrites auth and recorder companion modules for consumers', () => {
  const dir = makeProject();
  try {
    const auth = runAdd(['AuthEmailField'], dir);
    assert.equal(auth.status, 0, auth.stderr);
    for (const rel of ['AuthEmailField/AuthEmailField.tsx', 'AuthSignInCard/AuthMotion.tsx']) {
      assert.ok(existsSync(componentPath(dir, rel)), `${rel} must be copied`);
      const installed = readFileSync(componentPath(dir, rel), 'utf8');
      assert.equal(installed, registryContent(rel));
      assertNoPackageTerritoryImports(installed, rel);
    }
    assert.match(readFileSync(componentPath(dir, 'AuthEmailField/AuthEmailField.tsx'), 'utf8'), /from '\.\.\/AuthSignInCard\/AuthMotion'/);
    assert.match(readFileSync(componentPath(dir, 'AuthSignInCard/AuthMotion.tsx'), 'utf8'), /from 'cieo\/react'/);

    const recorder = runAdd(['VoiceRecorder'], dir);
    assert.equal(recorder.status, 0, recorder.stderr);
    for (const rel of ['VoiceRecorder/VoiceRecorder.tsx', 'VoiceRecorder/recorderVisual.ts']) {
      assert.ok(existsSync(componentPath(dir, rel)), `${rel} must be copied`);
      const installed = readFileSync(componentPath(dir, rel), 'utf8');
      assert.equal(installed, registryContent(rel));
      assertNoPackageTerritoryImports(installed, rel);
    }
    assert.match(readFileSync(componentPath(dir, 'VoiceRecorder/VoiceRecorder.tsx'), 'utf8'), /from '\.\/recorderVisual'/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a second add is a byte-for-byte no-op that leaves mtimes untouched', () => {
  const dir = makeProject();
  try {
    const first = runAdd(['dialog'], dir);
    assert.equal(first.status, 0, first.stderr);
    const before = new Map();
    for (const rel of FILES) {
      const file = componentPath(dir, rel);
      before.set(rel, readFileSync(file, 'utf8'));
      utimesSync(file, new Date(0), new Date(0));
      assert.equal(statSync(file).mtimeMs, 0, 'the fixture must start at the epoch');
    }

    const second = runAdd(['dialog'], dir);
    assert.equal(second.status, 0, second.stderr);
    assert.match(second.stdout, /0 copied, 5 unchanged, 0 skipped/);
    assert.doesNotMatch(second.stderr, /differs/);
    for (const rel of FILES) {
      assert.equal(readFileSync(componentPath(dir, rel), 'utf8'), before.get(rel));
      assert.equal(statSync(componentPath(dir, rel)).mtimeMs, 0, `${rel} must not be rewritten`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a user-edited file is skipped with the notice, then --overwrite replaces it', () => {
  const dir = makeProject();
  try {
    assert.equal(runAdd(['dialog'], dir).status, 0);
    const { file, edited } = editDialog(dir);

    const skipped = runAdd(['dialog'], dir);
    assert.equal(skipped.status, 0);
    assert.match(skipped.stdout, /0 copied, 4 unchanged, 1 skipped/);
    assert.match(skipped.stderr, /skipped Dialog\/Dialog\.tsx \(differs — re-run with --overwrite\)/);
    assert.equal(readFileSync(file, 'utf8'), edited);

    const overwritten = runAdd(['dialog', '--overwrite'], dir);
    assert.equal(overwritten.status, 0);
    assert.match(overwritten.stdout, /1 copied, 4 unchanged, 0 skipped/);
    assert.equal(readFileSync(file, 'utf8'), registryContent('Dialog/Dialog.tsx'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--dry-run reports the full plan and writes nothing at all', () => {
  const dir = makeProject();
  try {
    const result = runAdd(['dialog', '--dry-run'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Dry run/);
    assert.match(result.stdout, /5 copied, 0 unchanged, 0 skipped/);
    assert.deepEqual(readdirSync(dir), ['cieo.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--dry-run reports conflicts without touching the edited file', () => {
  const dir = makeProject();
  try {
    assert.equal(runAdd(['dialog'], dir).status, 0);
    const { file, edited } = editDialog(dir);

    const result = runAdd(['dialog', '--dry-run'], dir);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /0 copied, 4 unchanged, 1 skipped/);
    assert.match(result.stderr, /skipped Dialog\/Dialog\.tsx/);
    assert.equal(readFileSync(file, 'utf8'), edited);

    const wouldOverwrite = runAdd(['dialog', '--dry-run', '--overwrite'], dir);
    assert.equal(wouldOverwrite.status, 0);
    assert.match(wouldOverwrite.stdout, /1 copied, 4 unchanged, 0 skipped/);
    assert.equal(readFileSync(file, 'utf8'), edited);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a version-mismatched installed cieo warns with both versions and still exits 0', () => {
  const dir = makeProject();
  try {
    assert.notEqual(pkg.version, '0.0.1');
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'consumer', version: '1.0.0', dependencies: { cieo: '0.0.1' } }),
    );
    mkdirSync(join(dir, 'node_modules', 'cieo'), { recursive: true });
    writeFileSync(
      join(dir, 'node_modules', 'cieo', 'package.json'),
      JSON.stringify({ name: 'cieo', version: '0.0.1' }),
    );

    const result = runAdd(['dialog'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /0\.0\.1/);
    assert.match(result.stderr, new RegExp(pkg.version.replace(/\./g, '\\.')));
    assert.doesNotMatch(result.stderr, /does not depend on cieo/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a project without a cieo dependency gets the default npm install command', () => {
  const dir = makeProject();
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'consumer', version: '1.0.0' }));
    const result = runAdd(['dialog'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /'npm install cieo'/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a pnpm lockfile switches the install hint to pnpm add cieo', () => {
  const dir = makeProject();
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'consumer', version: '1.0.0' }));
    writeFileSync(join(dir, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
    const result = runAdd(['dialog'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /'pnpm add cieo'/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('copyPlan asks a TTY prompt for each conflict and honors skip', async () => {
  const dir = makeProject();
  try {
    const seed = await copyPlan({ root: dir, config: CONFIG, id: 'dialog' });
    assert.deepEqual(seed.copied, FILES);
    const { file, edited } = editDialog(dir);

    const { calls, prompt } = stubPrompt(['skip']);
    const { result, output } = await capture('stderr', () =>
      copyPlan({ root: dir, config: CONFIG, id: 'dialog', prompt }),
    );
    assert.equal(result.skipped.length, 1);
    assert.deepEqual(result.conflicts, ['Dialog/Dialog.tsx']);
    assert.deepEqual(result.unchanged, FILES.filter((file) => file !== 'Dialog/Dialog.tsx'));
    assert.equal(calls.length, 1);
    assert.match(calls[0].question, /Overwrite Dialog\/Dialog\.tsx\?/);
    assert.deepEqual(calls[0].options, ['overwrite', 'skip', 'diff']);
    assert.equal(calls[0].default, 1);
    assert.match(output, /skipped Dialog\/Dialog\.tsx \(differs — re-run with --overwrite\)/);
    assert.equal(readFileSync(file, 'utf8'), edited);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('copyPlan prints an aligned diff and re-asks exactly once before overwriting', async () => {
  const dir = makeProject();
  try {
    await copyPlan({ root: dir, config: CONFIG, id: 'dialog' });
    const { file } = editDialog(dir);

    const { calls, prompt } = stubPrompt(['diff', 'overwrite']);
    const { result, output } = await capture('stdout', () =>
      copyPlan({ root: dir, config: CONFIG, id: 'dialog', prompt }),
    );
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1].options, ['overwrite', 'skip']);
    assert.equal(calls[1].default, 1);
    assert.match(output, /^--- Dialog\/Dialog\.tsx(?: .*)?$/m);
    assert.match(output, /^- .*cieo-dialog-local/m);
    assert.match(output, /^\+ .*cieo-dialog(?!-local)/m);
    assert.equal(result.copied.length, 1);
    assert.equal(readFileSync(file, 'utf8'), registryContent('Dialog/Dialog.tsx'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a non-TTY prompt is never consulted', async () => {
  const dir = makeProject();
  try {
    await copyPlan({ root: dir, config: CONFIG, id: 'dialog' });
    const { file, edited } = editDialog(dir);

    const calls = [];
    const prompt = {
      tty: false,
      ask() {
        throw new Error('ask must not be called');
      },
      confirm() {
        throw new Error('confirm must not be called');
      },
      choose() {
        calls.push(1);
        throw new Error('choose must not be called');
      },
    };
    const result = await copyPlan({ root: dir, config: CONFIG, id: 'dialog', prompt });
    assert.equal(calls.length, 0);
    assert.equal(result.skipped.length, 1);
    assert.equal(readFileSync(file, 'utf8'), edited);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('copyPlan in dry-run consults a TTY prompt but writes nothing', async () => {
  const dir = makeProject();
  try {
    await copyPlan({ root: dir, config: CONFIG, id: 'dialog' });
    const { file, edited } = editDialog(dir);

    const { calls, prompt } = stubPrompt(['overwrite']);
    const { result } = await capture('stdout', () =>
      copyPlan({ root: dir, config: CONFIG, id: 'dialog', prompt, dryRun: true }),
    );
    assert.equal(calls.length, 1);
    assert.equal(result.copied.length, 1);
    assert.equal(result.conflicts.length, 1);
    assert.equal(readFileSync(file, 'utf8'), edited);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('copyPlan rejects an unknown id naming the run to see suggestions', async () => {
  const dir = makeProject();
  try {
    await assert.rejects(
      () => copyPlan({ root: dir, config: CONFIG, id: 'dialogg' }),
      /Unknown component 'dialogg'.*Did you mean: Dialog/m,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('add --help prints the usage without needing a config', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-add-'));
  try {
    const result = runAdd(['--help'], dir);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /cieo add <id>/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
