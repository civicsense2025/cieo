import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import doctor, { USAGE as DOCTOR_USAGE } from '../cli/commands/doctor.mjs';
import theme, { USAGE as THEME_USAGE } from '../cli/commands/theme.mjs';
import { themeFileFor, verifyThemeFile, writeThemeFile } from '../cli/lib/theme.mjs';
import { createTheme, toCSS } from '../design/index.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const bin = join(root, 'bin', 'cieo.mjs');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const DIR = 'src/components/cieo';
const CONFIG = { version: 1, target: 'vite', componentsDir: DIR, theme: {} };
const WIRED = `/* cieo:start */
import 'cieo/tokens.css';
import 'cieo/design.css';
import 'cieo/primitives.css';
import './cieo-theme.css';
/* cieo:end */
`;

function tempProject() {
  return mkdtempSync(join(tmpdir(), 'cieo-theme-doctor-'));
}

function writeConfigFile(dir, config) {
  writeFileSync(join(dir, 'cieo.json'), `${JSON.stringify(config, null, 2)}\n`);
}

function makeProject(config = CONFIG) {
  const dir = tempProject();
  writeConfigFile(dir, config);
  return dir;
}

function runCli(args, cwd) {
  return spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' });
}

function themeCss(axes) {
  return toCSS(createTheme(axes));
}

function addDialog(dir) {
  const result = runCli(['add', 'dialog'], dir);
  assert.equal(result.status, 0, result.stderr);
}

function makeHealthyProject() {
  const dir = makeProject();
  writeFileSync(
    join(dir, 'package.json'),
    `${JSON.stringify({ name: 'healthy', private: true, dependencies: { cieo: pkg.version } }, null, 2)}\n`,
  );
  mkdirSync(join(dir, 'node_modules', 'cieo'), { recursive: true });
  writeFileSync(join(dir, 'node_modules', 'cieo', 'package.json'), `${JSON.stringify({ name: 'cieo', version: pkg.version })}\n`);
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'main.tsx'), `${WIRED}import './App';\n`);
  addDialog(dir);
  return dir;
}

function makeBrokenProject() {
  const dir = makeProject({ ...CONFIG, alias: '@/cieo' });
  addDialog(dir);
  rmSync(join(dir, DIR, 'motion.ts'));
  return dir;
}

test('theme and doctor are exported commands with usage text', () => {
  assert.equal(typeof theme, 'function');
  assert.equal(typeof doctor, 'function');
  assert.match(THEME_USAGE, /cieo theme/);
  assert.match(DOCTOR_USAGE, /cieo doctor/);
  const dir = tempProject();
  try {
    for (const command of ['theme', 'doctor']) {
      const result = runCli([command, '--help'], dir);
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, new RegExp(`cieo ${command}`));
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('themeFileFor maps next, vite, and html to their stylesheet paths', () => {
  assert.equal(themeFileFor(join('tmp', 'app'), 'next'), join('tmp', 'app', 'app', 'cieo-theme.css'));
  assert.equal(themeFileFor(join('tmp', 'app'), 'vite'), join('tmp', 'app', 'src', 'cieo-theme.css'));
  assert.equal(themeFileFor(join('tmp', 'app'), 'html'), join('tmp', 'app', 'cieo-theme.css'));
  assert.equal(themeFileFor(join('tmp', 'app'), 'next'), join('tmp', 'app', 'app', 'cieo-theme.css'));
  assert.throws(() => themeFileFor(join('tmp', 'app'), 'svelte'), /target/);
});

test('writeThemeFile writes the generated CSS and verifyThemeFile compares it', () => {
  const dir = tempProject();
  try {
    const { file, css } = writeThemeFile(dir, 'vite', { brand: 'lagoon' });
    assert.equal(file, join(dir, 'src', 'cieo-theme.css'));
    assert.equal(css, themeCss({ brand: 'lagoon' }));
    assert.equal(readFileSync(file, 'utf8'), css);
    assert.deepEqual(readdirSync(join(dir, 'src')), ['cieo-theme.css']);
    assert.equal(verifyThemeFile(dir, 'vite', { brand: 'lagoon' }), true);
    assert.equal(verifyThemeFile(dir, 'vite', { brand: 'iris' }), false);
    assert.equal(verifyThemeFile(dir, 'html', {}), false);
    assert.throws(() => writeThemeFile(dir, 'vite', { brand: 'not-a-brand' }), /Invalid brand/);
    assert.deepEqual(readdirSync(join(dir, 'src')), ['cieo-theme.css']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme updates cieo.json and regenerates the stylesheet', () => {
  const dir = makeProject();
  try {
    const result = runCli(['theme', 'brand=lagoon', 'scheme=dark'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Wrote .*cieo-theme\.css/);
    const stored = JSON.parse(readFileSync(join(dir, 'cieo.json'), 'utf8'));
    assert.deepEqual(stored.theme, { brand: 'lagoon', scheme: 'dark' });
    assert.equal(readFileSync(join(dir, 'src', 'cieo-theme.css'), 'utf8'), themeCss({ brand: 'lagoon', scheme: 'dark' }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme with no pairs regenerates the stylesheet from the stored theme', () => {
  const dir = makeProject();
  try {
    assert.equal(runCli(['theme', 'density=compact'], dir).status, 0);
    rmSync(join(dir, 'src', 'cieo-theme.css'));
    const result = runCli(['theme'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(join(dir, 'src', 'cieo-theme.css'), 'utf8'), themeCss({ density: 'compact' }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme --print prints the CSS and writes nothing', () => {
  const dir = makeProject();
  try {
    const before = readFileSync(join(dir, 'cieo.json'), 'utf8');
    const result = runCli(['theme', '--print', 'brand=lagoon'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, themeCss({ brand: 'lagoon' }));
    assert.equal(readFileSync(join(dir, 'cieo.json'), 'utf8'), before);
    assert.deepEqual(readdirSync(dir), ['cieo.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme --print leaves an existing config and stylesheet untouched', () => {
  const dir = makeProject();
  try {
    assert.equal(runCli(['theme', 'brand=lagoon'], dir).status, 0);
    const configBefore = readFileSync(join(dir, 'cieo.json'), 'utf8');
    const cssBefore = readFileSync(join(dir, 'src', 'cieo-theme.css'), 'utf8');
    const result = runCli(['theme', '--print', 'brand=iris', 'scheme=dark'], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, themeCss({ brand: 'iris', scheme: 'dark' }));
    assert.equal(readFileSync(join(dir, 'cieo.json'), 'utf8'), configBefore);
    assert.equal(readFileSync(join(dir, 'src', 'cieo-theme.css'), 'utf8'), cssBefore);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme rejects a bare argument and an unknown key without writing', () => {
  const dir = makeProject();
  try {
    const bare = runCli(['theme', 'brand'], dir);
    assert.equal(bare.status, 2);
    assert.match(bare.stderr, /cieo theme/);

    const unknown = runCli(['theme', 'pallete=x'], dir);
    assert.equal(unknown.status, 1);
    assert.match(unknown.stderr, /Unknown theme key 'pallete'/);
    assert.match(unknown.stderr, /brand, scheme, density, radius/);

    const invalid = runCli(['theme', 'brand=not-a-brand'], dir);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /Invalid brand: not-a-brand/);

    assert.deepEqual(readdirSync(dir), ['cieo.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme without cieo.json names the init command and exits 1', () => {
  const dir = tempProject();
  try {
    const result = runCli(['theme', 'brand=lagoon'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /No cieo\.json found/);
    assert.match(result.stderr, /npx cieo init/);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('theme keeps unknown config keys such as $schema after the known ones', () => {
  const dir = tempProject();
  try {
    const source = `{
  "version": 1,
  "target": "vite",
  "componentsDir": "src/components/cieo",
  "theme": {},
  "$schema": "https://cieo.dev/schemas/cieo.json"
}
`;
    writeFileSync(join(dir, 'cieo.json'), source);
    const result = runCli(['theme', 'brand=lagoon'], dir);
    assert.equal(result.status, 0, result.stderr);
    const text = readFileSync(join(dir, 'cieo.json'), 'utf8');
    const parsed = JSON.parse(text);
    assert.equal(parsed.$schema, 'https://cieo.dev/schemas/cieo.json');
    assert.deepEqual(parsed.theme, { brand: 'lagoon' });
    assert.ok(text.indexOf('"theme"') < text.indexOf('"$schema"'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor fails a broken project, naming every failing check with a fix', () => {
  const dir = makeBrokenProject();
  try {
    const result = runCli(['doctor'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /^ok config: /m);
    assert.match(result.stdout, /^fail package: .*\n {2}fix: npm install cieo@latest$/m);
    assert.match(result.stdout, /^fail entry: .*src\/main\.tsx.*\n {2}fix: .*npx cieo init --force/m);
    assert.match(result.stdout, /import 'cieo\/tokens\.css';/);
    assert.match(result.stdout, /import '\.\/cieo-theme\.css';/);
    assert.match(result.stdout, /^fail components: .*motion\.ts.*\n {2}fix: npx cieo add Dialog$/m);
    assert.match(result.stdout, /^warn alias: .*@\/cieo.*tsconfig\.json/m);
    assert.doesNotMatch(result.stdout, /^ok package: /m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor on a healthy project exits 0 without warnings', () => {
  const dir = makeHealthyProject();
  try {
    const result = runCli(['doctor'], dir);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /^ok config: /m);
    assert.match(result.stdout, /^ok package: cieo .* is installed and matches this CLI$/m);
    assert.match(result.stdout, /^ok entry: cieo styles are wired in src\/main\.tsx$/m);
    assert.match(result.stdout, /^ok components: 2 copied components match the registry$/m);
    assert.match(result.stdout, /^ok alias: no alias configured$/m);
    assert.doesNotMatch(result.stdout, /^(?:warn|fail) /m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor warns about a user-modified component file and still exits 0', () => {
  const dir = makeHealthyProject();
  try {
    const file = join(dir, DIR, 'Dialog', 'Dialog.tsx');
    writeFileSync(file, readFileSync(file, 'utf8').replace('cieo-dialog', 'cieo-dialog-local'));
    const result = runCli(['doctor'], dir);
    assert.equal(result.status, 0, result.stdout);
    assert.match(
      result.stdout,
      /^warn components: 1 local file differs from the registry \(your edits are kept\): Dialog\/Dialog\.tsx$/m,
    );
    assert.doesNotMatch(result.stdout, /^fail /m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor --json prints machine-readable results and exits by the same rule', () => {
  const dir = makeBrokenProject();
  try {
    const result = runCli(['doctor', '--json'], dir);
    assert.equal(result.status, 1);
    const payload = JSON.parse(result.stdout);
    assert.deepEqual(Object.keys(payload), ['checks', 'failures', 'warnings']);
    assert.deepEqual(payload.checks.map((check) => check.name), ['config', 'package', 'entry', 'components', 'alias']);
    assert.equal(payload.failures, 3);
    assert.equal(payload.warnings, 1);
    for (const check of payload.checks) {
      assert.deepEqual(Object.keys(check).filter((key) => !['name', 'status', 'detail', 'fix'].includes(key)), []);
      assert.equal(typeof check.detail, 'string');
      assert.ok(['ok', 'warn', 'fail'].includes(check.status));
      if (check.status === 'fail') assert.equal(typeof check.fix, 'string');
      else assert.equal(Object.hasOwn(check, 'fix'), false);
    }
    assert.deepEqual(
      payload.checks.filter((check) => check.status === 'fail').map((check) => check.name),
      ['package', 'entry', 'components'],
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor reports a missing config first and skips the checks that need it', () => {
  const dir = tempProject();
  try {
    const result = runCli(['doctor'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /^fail config: No cieo\.json found.*\n {2}fix: npx cieo init$/m);
    assert.match(result.stdout, /^warn package: not checked/m);

    const json = runCli(['doctor', '--json'], dir);
    assert.equal(json.status, 1);
    const payload = JSON.parse(json.stdout);
    assert.equal(payload.failures, 1);
    assert.equal(payload.warnings, 4);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
