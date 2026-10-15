import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { PassThrough } from 'node:stream';
import { detectPackageManager, detectTarget, hasReact, readPackageJson } from '../cli/lib/detect.mjs';
import { createPrompt } from '../cli/lib/prompt.mjs';

function stubTree(entries) {
  const root = mkdtempSync(join(tmpdir(), 'cieo-detect-'));
  for (const [rel, content] of Object.entries(entries)) {
    const target = join(root, rel);
    if (rel.endsWith('/')) {
      mkdirSync(target, { recursive: true });
    } else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }
  return root;
}

function withTree(entries, run) {
  const root = stubTree(entries);
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function manifest(contents) {
  return JSON.stringify(contents);
}

test('detectTarget finds next projects for each config extension with an app dir', () => {
  for (const extension of ['js', 'mjs', 'ts']) {
    withTree({ [`next.config.${extension}`]: '', 'app/': null }, (root) => {
      assert.equal(detectTarget(root), 'next');
    });
  }
});

test('detectTarget needs both the next config and the app directory', () => {
  withTree({ 'next.config.js': '' }, (root) => {
    assert.equal(detectTarget(root), null);
  });
  withTree({ 'app/': null }, (root) => {
    assert.equal(detectTarget(root), null);
  });
});

test('detectTarget finds vite projects with react in any dependency bucket', () => {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    withTree(
      { 'vite.config.js': '', 'package.json': manifest({ [field]: { react: '^18.0.0' } }) },
      (root) => {
        assert.equal(detectTarget(root), 'vite');
      },
    );
  }
  for (const extension of ['mjs', 'ts']) {
    withTree(
      { [`vite.config.${extension}`]: '', 'package.json': manifest({ dependencies: { react: '^18' } }) },
      (root) => {
        assert.equal(detectTarget(root), 'vite');
      },
    );
  }
});

test('detectTarget needs react for vite and a vite config at all', () => {
  withTree({ 'vite.config.js': '', 'package.json': manifest({ dependencies: { vue: '^3' } }) }, (root) => {
    assert.equal(detectTarget(root), null);
  });
  withTree({ 'package.json': manifest({ dependencies: { react: '^18' } }) }, (root) => {
    assert.equal(detectTarget(root), null);
  });
});

test('detectTarget prefers next when both configs and app/ exist', () => {
  withTree(
    {
      'next.config.ts': '',
      'vite.config.ts': '',
      'app/': null,
      'package.json': manifest({ dependencies: { react: '^18' } }),
    },
    (root) => {
      assert.equal(detectTarget(root), 'next');
    },
  );
});

test('detectTarget returns null for an empty project', () => {
  withTree({}, (root) => {
    assert.equal(detectTarget(root), null);
  });
});

test('detectPackageManager reports each lockfile and defaults to npm', () => {
  withTree({ 'pnpm-lock.yaml': '' }, (root) => assert.equal(detectPackageManager(root), 'pnpm'));
  withTree({ 'yarn.lock': '' }, (root) => assert.equal(detectPackageManager(root), 'yarn'));
  withTree({ 'bun.lockb': '' }, (root) => assert.equal(detectPackageManager(root), 'bun'));
  withTree({ 'bun.lock': '' }, (root) => assert.equal(detectPackageManager(root), 'bun'));
  withTree({ 'package-lock.json': '' }, (root) => assert.equal(detectPackageManager(root), 'npm'));
  withTree({}, (root) => assert.equal(detectPackageManager(root), 'npm'));
});

test('detectPackageManager resolves conflicts in pnpm, yarn, bun order', () => {
  withTree({ 'pnpm-lock.yaml': '', 'yarn.lock': '', 'bun.lock': '' }, (root) => {
    assert.equal(detectPackageManager(root), 'pnpm');
  });
  withTree({ 'yarn.lock': '', 'bun.lockb': '' }, (root) => {
    assert.equal(detectPackageManager(root), 'yarn');
  });
  withTree({ 'package-lock.json': '', 'bun.lock': '' }, (root) => {
    assert.equal(detectPackageManager(root), 'bun');
  });
});

test('readPackageJson parses a manifest, or returns null when missing or malformed', () => {
  withTree({ 'package.json': manifest({ name: 'demo', dependencies: { react: '18' } }) }, (root) => {
    assert.deepEqual(readPackageJson(root), { name: 'demo', dependencies: { react: '18' } });
  });
  withTree({ 'package.json': '{ nope' }, (root) => {
    assert.equal(readPackageJson(root), null);
  });
  withTree({ 'package.json': 'null' }, (root) => {
    assert.equal(readPackageJson(root), null);
  });
  withTree({ 'package.json': '[]' }, (root) => {
    assert.equal(readPackageJson(root), null);
  });
  withTree({}, (root) => {
    assert.equal(readPackageJson(root), null);
  });
});

test('readPackageJson never throws when package.json is a directory', () => {
  withTree({ 'package.json/': null }, (root) => {
    assert.equal(readPackageJson(root), null);
  });
});

test('hasReact checks all three dependency buckets and stays false for broken manifests', () => {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    withTree({ 'package.json': manifest({ [field]: { react: '^18.0.0' } }) }, (root) => {
      assert.equal(hasReact(root), true);
    });
  }
  withTree({ 'package.json': manifest({ dependencies: { vue: '^3' } }) }, (root) => {
    assert.equal(hasReact(root), false);
  });
  withTree({ 'package.json': '{ nope' }, (root) => {
    assert.equal(hasReact(root), false);
  });
  withTree({}, (root) => {
    assert.equal(hasReact(root), false);
  });
});

function streamPair({ tty = false } = {}) {
  const input = new PassThrough();
  const output = new PassThrough();
  if (tty) {
    input.isTTY = true;
    output.isTTY = true;
  }
  const chunks = [];
  output.on('data', (chunk) => chunks.push(chunk.toString('utf8')));
  return { input, output, written: () => chunks.join('') };
}

test('non-TTY methods return their defaults without writing or reading', async () => {
  const { input, output, written } = streamPair();
  const prompt = createPrompt({ input, output });
  assert.equal(prompt.tty, false);
  assert.equal(await prompt.ask('Name?', { default: 'anon' }), 'anon');
  assert.equal(await prompt.ask('Name?'), undefined);
  assert.equal(await prompt.choose('Pick', ['first', 'second'], { default: 1 }), 'second');
  assert.equal(await prompt.choose('Pick', ['first', 'second']), 'first');
  assert.equal(await prompt.confirm('Go?', { default: true }), true);
  assert.equal(await prompt.confirm('Go?'), false);
  assert.equal(written(), '');
  assert.equal(input.listenerCount('data'), 0);
});

test('yes forces non-TTY even when both streams are TTYs', async () => {
  const { input, output, written } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output, yes: true });
  assert.equal(prompt.tty, false);
  assert.equal(await prompt.ask('Name?', { default: 'anon' }), 'anon');
  assert.equal(await prompt.choose('Pick', ['first', 'second'], { default: 1 }), 'second');
  assert.equal(await prompt.confirm('Go?', { default: true }), true);
  assert.equal(written(), '');
  assert.equal(input.listenerCount('data'), 0);
});

test('CI forces non-TTY even when both streams are TTYs', async () => {
  const previous = process.env.CI;
  process.env.CI = '1';
  try {
    const { input, output, written } = streamPair({ tty: true });
    const prompt = createPrompt({ input, output });
    assert.equal(prompt.tty, false);
    assert.equal(await prompt.ask('Name?', { default: 'anon' }), 'anon');
    assert.equal(written(), '');
    assert.equal(input.listenerCount('data'), 0);
  } finally {
    if (previous === undefined) delete process.env.CI;
    else process.env.CI = previous;
  }
});

test('TTY ask trims the typed value and uses the default on an empty line', async () => {
  const { input, output, written } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  assert.equal(prompt.tty, true);
  const pending = prompt.ask('Name?', { default: 'anon' });
  input.write('  Ada  \n');
  assert.equal(await pending, 'Ada');
  input.write('\n');
  assert.equal(await prompt.ask('Name?', { default: 'anon' }), 'anon');
  assert.match(written(), /Name\?/);
});

test('TTY choose accepts a 1-based number and prints numbered options', async () => {
  const { input, output, written } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  const pending = prompt.choose('Pick one', ['first', 'second'], { default: 1 });
  input.write('2\n');
  assert.equal(await pending, 'second');
  assert.match(written(), /1\) first/);
  assert.match(written(), /2\) second \(default\)/);
});

test('TTY choose uses the default option on an empty line', async () => {
  const { input, output } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  input.write('\n');
  assert.equal(await prompt.choose('Pick one', ['first', 'second'], { default: 1 }), 'second');
  input.write('\n');
  assert.equal(await prompt.choose('Pick one', ['first', 'second']), 'first');
});

test('TTY choose re-asks once after invalid input, then falls back to the default', async () => {
  const { input, output, written } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  input.write('9\n2\n');
  assert.equal(await prompt.choose('Pick one', ['first', 'second']), 'second');
  assert.ok((written().match(/Pick one/g) ?? []).length >= 2, 'the question must be printed again for the re-ask');
  input.write('0\nnope\n');
  assert.equal(await prompt.choose('Pick one', ['first', 'second'], { default: 1 }), 'second');
});

test('TTY ask and choose collect a line buffered before the question', async () => {
  const { input, output } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  input.write('buffered\n');
  assert.equal(await prompt.ask('Name?'), 'buffered');
  input.write('1\n');
  assert.equal(await prompt.choose('Pick one', ['first', 'second']), 'first');
});

test('EOF resolves ask, choose and confirm with their defaults', async () => {
  const { input, output } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  const pending = prompt.ask('Name?', { default: 'anon' });
  input.end();
  assert.equal(await pending, 'anon');
  assert.equal(await prompt.choose('Pick one', ['first', 'second'], { default: 1 }), 'second');
  assert.equal(await prompt.confirm('Go?', { default: true }), true);
});

test('an input that already ended resolves new questions with their defaults', async () => {
  const { input, output, written } = streamPair({ tty: true });
  input.end();
  const prompt = createPrompt({ input, output });
  assert.equal(await prompt.ask('Name?', { default: 'anon' }), 'anon');
  assert.equal(written(), 'Name? ');
});

test('TTY confirm maps y/yes/n/no/empty and re-asks once for anything else', async () => {
  const { input, output } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  input.write('y\n');
  assert.equal(await prompt.confirm('Go?'), true);
  input.write('YES\n');
  assert.equal(await prompt.confirm('Go?'), true);
  input.write('n\n');
  assert.equal(await prompt.confirm('Go?', { default: true }), false);
  input.write('No\n');
  assert.equal(await prompt.confirm('Go?', { default: true }), false);
  input.write('\n');
  assert.equal(await prompt.confirm('Go?', { default: true }), true);
  input.write('maybe\ny\n');
  assert.equal(await prompt.confirm('Go?'), true);
  input.write('maybe\nhuh\n');
  assert.equal(await prompt.confirm('Go?', { default: true }), true);
});

test('close removes listeners, is idempotent, and answers later questions with defaults', async () => {
  const { input, output, written } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  input.write('Ada\n');
  assert.equal(await prompt.ask('Name?'), 'Ada');
  assert.ok(input.listenerCount('data') > 0);
  prompt.close();
  assert.equal(input.listenerCount('data'), 0);
  assert.equal(input.listenerCount('end'), 0);
  assert.equal(input.listenerCount('error'), 0);
  const before = written();
  prompt.close();
  assert.equal(await prompt.ask('Name?', { default: 'anon' }), 'anon');
  assert.equal(written(), before);
});

test('close resolves a pending question with its default', async () => {
  const { input, output } = streamPair({ tty: true });
  const prompt = createPrompt({ input, output });
  const pending = prompt.ask('Name?', { default: 'anon' });
  prompt.close();
  assert.equal(await pending, 'anon');
});
