import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import init, { USAGE } from '../cli/commands/init.mjs';
import { MARKER_BLOCK } from '../cli/lib/entry.mjs';
import { rewriteImports } from '../cli/lib/rewrite.mjs';
import { createTheme, toCSS } from '../design/index.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const bin = join(root, 'bin', 'cieo.mjs');

function tempDir() {
  return mkdtempSync(join(tmpdir(), 'cieo-init-'));
}

function write(dir, rel, content) {
  const path = join(dir, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function viteProject() {
  const dir = tempDir();
  write(dir, 'package.json', JSON.stringify({ name: 'app', private: true, dependencies: { react: '^19.0.0' } }, null, 2));
  write(dir, 'vite.config.ts', "import { defineConfig } from 'vite';\n\nexport default defineConfig({});\n");
  write(dir, 'tsconfig.json', JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }, null, 2));
  write(dir, 'src/main.tsx', "import { createRoot } from 'react-dom/client';\n\ncreateRoot(document.getElementById('root'));\n");
  return dir;
}

function nextProject() {
  const dir = tempDir();
  write(dir, 'package.json', JSON.stringify({ name: 'app', private: true, dependencies: { next: '^15.0.0', react: '^19.0.0' } }, null, 2));
  write(dir, 'next.config.mjs', 'export default {};\n');
  write(dir, 'tsconfig.json', JSON.stringify({ compilerOptions: {} }, null, 2));
  write(
    dir,
    'app/layout.tsx',
    "import type { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return <html lang=\"en\"><body>{children}</body></html>;\n}\n",
  );
  return dir;
}

function runInit(args, cwd, options = {}) {
  return spawnSync(process.execPath, [bin, 'init', ...args], { cwd, encoding: 'utf8', ...options });
}

function hashTree(dir) {
  const lines = [];
  const walk = (current) => {
    const entries = readdirSync(current, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
    for (const entry of entries) {
      if (entry.name === 'node_modules') continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        lines.push(`${relative(dir, path)}/`);
        walk(path);
      } else {
        lines.push(`${relative(dir, path)}:${createHash('sha256').update(readFileSync(path)).digest('hex')}`);
      }
    }
  };
  walk(dir);
  return lines.join('\n');
}

function registryContent(rel) {
  return rewriteImports(readFileSync(join(root, 'registry', rel), 'utf8'), rel);
}

function readConfigFile(dir) {
  return JSON.parse(readFileSync(join(dir, 'cieo.json'), 'utf8'));
}

function fakeManager(dir, name, status) {
  write(dir, name, `#!/bin/sh\nexit ${status}\n`);
  chmodSync(join(dir, name), 0o755);
}

test('init exports a command, usage text, and a help path that writes nothing', () => {
  assert.equal(typeof init, 'function');
  assert.match(USAGE, /cieo init/);
  for (const flag of ['--yes', '--target', '--brand', '--scheme', '--dir', '--with', '--no-starter', '--skip-install', '--force']) {
    assert.match(USAGE, new RegExp(flag));
  }
  const dir = tempDir();
  try {
    const result = runInit(['--help'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /cieo init/);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown --target exits 1 naming the valid targets', () => {
  const dir = tempDir();
  try {
    const result = runInit(['--yes', '--target', 'svelte'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /svelte/);
    assert.match(result.stderr, /next, vite, or html/);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('init --yes --skip-install --with dialog sets up a working vite project', () => {
  const dir = viteProject();
  try {
    const result = runInit(['--yes', '--skip-install', '--with', 'dialog'], dir);
    assert.equal(result.status, 0, result.stderr);

    const text = readFileSync(join(dir, 'cieo.json'), 'utf8');
    const stored = JSON.parse(text);
    assert.deepEqual(stored, {
      version: 1,
      target: 'vite',
      componentsDir: 'components/cieo',
      alias: '@/components/cieo',
      theme: { brand: 'iris', scheme: 'light' },
    });
    assert.ok(text.indexOf('"componentsDir"') < text.indexOf('"alias"'));
    assert.ok(text.indexOf('"alias"') < text.indexOf('"theme"'));

    assert.equal(
      readFileSync(join(dir, 'src', 'cieo-theme.css'), 'utf8'),
      toCSS(createTheme({ brand: 'iris', scheme: 'light' })),
    );

    const main = readFileSync(join(dir, 'src', 'main.tsx'), 'utf8');
    assert.ok(main.includes(MARKER_BLOCK), 'the whole marker block must be wired');
    assert.match(main, /^import \{ createRoot \} from 'react-dom\/client';$/m);

    for (const rel of ['Dialog/Dialog.tsx', 'Overlay/Overlay.tsx', 'motion.ts']) {
      const file = join(dir, 'components', 'cieo', rel);
      assert.ok(existsSync(file), `${rel} must be copied`);
      const copied = readFileSync(file, 'utf8');
      assert.equal(copied, registryContent(rel));
      assert.doesNotMatch(copied, /\.\.\/\.\.\//, `${rel} must not keep package-territory imports`);
    }
    assert.match(readFileSync(join(dir, 'components', 'cieo', 'Dialog', 'Dialog.tsx'), 'utf8'), /from 'cieo\/react'/);

    assert.match(result.stdout, /npx cieo add/);
    assert.match(result.stdout, /docs\/installation\.md/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('init detects a next project and wires app/layout.tsx', () => {
  const dir = nextProject();
  try {
    const result = runInit(['--yes', '--skip-install', '--no-starter'], dir);
    assert.equal(result.status, 0, result.stderr);

    const stored = readConfigFile(dir);
    assert.equal(stored.target, 'next');
    assert.equal(Object.hasOwn(stored, 'alias'), false);

    const layout = readFileSync(join(dir, 'app', 'layout.tsx'), 'utf8');
    assert.ok(layout.includes(MARKER_BLOCK), 'the marker block must land in the layout');
    assert.match(layout, /export default function Layout/);
    assert.ok(existsSync(join(dir, 'app', 'cieo-theme.css')));
    assert.equal(existsSync(join(dir, 'src')), false);
    assert.equal(existsSync(join(dir, 'components')), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('init on a plain directory takes the html path: theme file plus printed links', () => {
  const dir = tempDir();
  try {
    write(dir, 'index.html', '<!doctype html><html><body><h1>Hi</h1></body></html>\n');
    const result = runInit(['--yes', '--skip-install'], dir);
    assert.equal(result.status, 0, result.stderr);

    const stored = readConfigFile(dir);
    assert.equal(stored.target, 'html');
    assert.deepEqual(stored.theme, { brand: 'iris', scheme: 'light' });
    assert.equal(
      stored.componentsDir,
      'components/cieo',
      'the committed config library requires componentsDir for every target; html keeps the inert default so doctor can read it',
    );

    assert.equal(
      readFileSync(join(dir, 'cieo-theme.css'), 'utf8'),
      toCSS(createTheme({ brand: 'iris', scheme: 'light' })),
    );

    const links = [
      '<link rel="stylesheet" href="node_modules/cieo/tokens/tokens.css">',
      '<link rel="stylesheet" href="node_modules/cieo/design/themes.css">',
      '<link rel="stylesheet" href="node_modules/cieo/design/primitives.css">',
      '<link rel="stylesheet" href="cieo-theme.css">',
    ];
    let position = -1;
    for (const link of links) {
      const next = result.stdout.indexOf(link);
      assert.ok(next > position, `${link} must be printed after the previous link`);
      position = next;
    }
    assert.match(result.stdout, /without node_modules/);

    assert.deepEqual(readdirSync(dir).sort(), ['cieo-theme.css', 'cieo.json', 'index.html']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--target html with --with exits 1 and writes nothing', () => {
  const dir = tempDir();
  try {
    write(dir, 'index.html', '<!doctype html><html><body></body></html>\n');
    const result = runInit(['--yes', '--skip-install', '--with', 'dialog'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /components need a React project \(target next\/vite\)/);
    assert.deepEqual(readdirSync(dir), ['index.html']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a JS project without tsconfig.json fails with the tsconfig fix', () => {
  const dir = tempDir();
  try {
    write(dir, 'package.json', JSON.stringify({ name: 'app', private: true, dependencies: { react: '^19.0.0' } }));
    write(dir, 'vite.config.ts', 'export default {};\n');
    write(dir, 'src/main.jsx', 'console.log("hi");\n');
    const result = runInit(['--yes', '--skip-install', '--target', 'vite'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /components are TypeScript/);
    assert.match(result.stderr, /tsconfig\.json/);
    assert.match(result.stderr, /--target html/);
    assert.deepEqual(readdirSync(dir).sort(), ['package.json', 'src', 'vite.config.ts']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an existing config refuses silently in non-tty and points at --force', () => {
  const dir = viteProject();
  try {
    assert.equal(runInit(['--yes', '--skip-install', '--with', 'dialog'], dir).status, 0);
    const before = hashTree(dir);
    const second = runInit(['--yes', '--skip-install'], dir);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /re-run with --force/);
    assert.equal(hashTree(dir), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--force re-run is byte-for-byte identical to the first run', () => {
  const dir = viteProject();
  try {
    const first = runInit(['--yes', '--skip-install', '--with', 'dialog'], dir);
    assert.equal(first.status, 0, first.stderr);
    const before = hashTree(dir);

    const second = runInit(['--yes', '--skip-install', '--with', 'dialog', '--force'], dir);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(hashTree(dir), before);
    assert.match(readFileSync(join(dir, 'src', 'main.tsx'), 'utf8'), /cieo:start/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--brand, --scheme, and --dir flags override the defaults', () => {
  const dir = viteProject();
  try {
    const result = runInit(
      ['--yes', '--skip-install', '--brand', 'lagoon', '--scheme', 'dark', '--dir', 'src/cieo'],
      dir,
    );
    assert.equal(result.status, 0, result.stderr);

    const stored = readConfigFile(dir);
    assert.equal(stored.componentsDir, 'src/cieo');
    assert.equal(stored.alias, '@/src/cieo');
    assert.deepEqual(stored.theme, { brand: 'lagoon', scheme: 'dark' });
    assert.equal(
      readFileSync(join(dir, 'src', 'cieo-theme.css'), 'utf8'),
      toCSS(createTheme({ brand: 'lagoon', scheme: 'dark' })),
    );
    assert.ok(existsSync(join(dir, 'src', 'cieo', 'Dialog', 'Dialog.tsx')), 'the default Dialog starter follows --dir');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--no-starter copies no component but still writes config, theme, and wiring', () => {
  const dir = viteProject();
  try {
    const result = runInit(['--yes', '--skip-install', '--no-starter'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(dir, 'cieo.json')));
    assert.ok(existsSync(join(dir, 'src', 'cieo-theme.css')));
    assert.match(readFileSync(join(dir, 'src', 'main.tsx'), 'utf8'), /cieo:start/);
    assert.equal(existsSync(join(dir, 'components')), false);
    assert.match(result.stdout, /Starter component: skipped/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown --with id exits 1 with suggestions and writes nothing', () => {
  const dir = viteProject();
  try {
    const before = hashTree(dir);
    const result = runInit(['--yes', '--skip-install', '--with', 'dialogg'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown component 'dialogg'/);
    assert.match(result.stderr, /Did you mean: .*Dialog/);
    assert.match(result.stderr, /npx cieo list/);
    assert.equal(hashTree(dir), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--with and --no-starter together are a usage error', () => {
  const dir = viteProject();
  try {
    const result = runInit(['--yes', '--with', 'dialog', '--no-starter'], dir);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /mutually exclusive/);
    assert.equal(existsSync(join(dir, 'cieo.json')), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a failed npm install warns with the manual command and still exits 0', () => {
  const dir = viteProject();
  const fake = tempDir();
  try {
    fakeManager(fake, 'npm', 7);
    const result = runInit(['--yes', '--no-starter'], dir, {
      env: { ...process.env, PATH: `${fake}:${process.env.PATH}` },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /npm install cieo/);
    assert.match(result.stderr, /npx cieo doctor/);
    assert.ok(existsSync(join(dir, 'cieo.json')));
    assert.ok(existsSync(join(dir, 'src', 'cieo-theme.css')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(fake, { recursive: true, force: true });
  }
});

test('a pnpm lockfile selects pnpm add cieo for the install warning', () => {
  const dir = viteProject();
  const fake = tempDir();
  try {
    write(dir, 'pnpm-lock.yaml', 'lockfileVersion: 9\n');
    fakeManager(fake, 'pnpm', 1);
    const result = runInit(['--yes', '--no-starter'], dir, {
      env: { ...process.env, PATH: `${fake}:${process.env.PATH}` },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /pnpm add cieo/);
    assert.match(result.stderr, /npx cieo doctor/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(fake, { recursive: true, force: true });
  }
});
