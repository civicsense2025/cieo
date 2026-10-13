import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CONFIG_NAME, readConfig, validateConfig, writeConfig } from '../cli/lib/config.mjs';

const VALID = {
  version: 1,
  target: 'vite',
  componentsDir: 'src/components/cieo',
  alias: '@/cieo',
  theme: { brand: 'lagoon' },
};

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'cieo-config-'));
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

function assertFieldError(operation, field, extra) {
  assert.throws(operation, (error) => {
    assert.equal(error.constructor, Error);
    assert.match(error.message, field);
    if (extra) assert.match(error.message, extra);
    return true;
  });
}

test('validateConfig accepts the full shape and partial themes', () => {
  assert.equal(CONFIG_NAME, 'cieo.json');
  assert.deepEqual(validateConfig(VALID), VALID);
  assert.deepEqual(validateConfig({ ...VALID, theme: { brand: 'lagoon' } }).theme, { brand: 'lagoon' });
  assert.deepEqual(validateConfig({ version: 1, target: 'html', componentsDir: '.', theme: {} }), {
    version: 1,
    target: 'html',
    componentsDir: '.',
    theme: {},
  });
});

const invalidCases = [
  ['a wrong version', { ...VALID, version: 2 }, /version/],
  ['an unknown target', { ...VALID, target: 'svelte' }, /target/, /next, vite, html/],
  ['an absolute componentsDir', { ...VALID, componentsDir: '/var/tmp/components' }, /componentsDir/],
  ['a Windows absolute componentsDir', { ...VALID, componentsDir: 'C:\\Users\\me\\components' }, /componentsDir/],
  ['a componentsDir escaping the project', { ...VALID, componentsDir: '../outside' }, /componentsDir/],
  ['an empty componentsDir', { ...VALID, componentsDir: '' }, /componentsDir/],
  ['a non-string componentsDir', { ...VALID, componentsDir: 7 }, /componentsDir/],
  ['a non-string alias', { ...VALID, alias: 7 }, /alias/],
  ['a missing theme', { ...VALID, theme: undefined }, /theme/],
  ['a theme that is not an object', { ...VALID, theme: 'lagoon' }, /theme/],
  ['an invalid brand', { ...VALID, theme: { brand: 'not-a-brand' } }, /theme/, /brand/],
  ['an unknown theme key', { ...VALID, theme: { pallete: 'x' } }, /theme/, /pallete/],
];

for (const [name, config, field, extra] of invalidCases) {
  test(`validateConfig rejects ${name}, naming the field`, () => {
    assertFieldError(() => validateConfig(config), field, extra);
  });
}

test('writeConfig writes stable key order, two-space indent, and a trailing newline', () => {
  const root = tempRoot();
  try {
    writeConfig(root, VALID);
    assert.equal(readFileSync(join(root, CONFIG_NAME), 'utf8'), `{
  "version": 1,
  "target": "vite",
  "componentsDir": "src/components/cieo",
  "alias": "@/cieo",
  "theme": {
    "brand": "lagoon"
  }
}
`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('writeConfig omits alias when it is undefined', () => {
  const root = tempRoot();
  try {
    writeConfig(root, { version: 1, target: 'next', componentsDir: 'app/components', theme: { scheme: 'dark' } });
    const text = readFileSync(join(root, CONFIG_NAME), 'utf8');
    assert.doesNotMatch(text, /alias/);
    const read = readConfig(root);
    assert.equal(Object.hasOwn(read.config, 'alias'), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('readConfig round-trips what writeConfig wrote, with its path', () => {
  const root = tempRoot();
  try {
    writeConfig(root, VALID);
    const read = readConfig(root);
    assert.equal(read.path, join(root, CONFIG_NAME));
    assert.deepEqual(read.config, VALID);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('readConfig returns null when cieo.json does not exist', () => {
  const root = tempRoot();
  try {
    assert.equal(readConfig(root), null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('readConfig names the file and the JSON error for malformed JSON', () => {
  const root = tempRoot();
  try {
    const file = join(root, CONFIG_NAME);
    writeFileSync(file, '{ "version": 1,, }\n');
    assert.throws(() => readConfig(root), (error) => {
      assert.equal(error.constructor, Error);
      assert.ok(error.message.includes(file), `message must name ${file}`);
      assert.match(error.message, /JSON/);
      return true;
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('readConfig validates what it read, naming the field', () => {
  const root = tempRoot();
  try {
    writeFileSync(join(root, CONFIG_NAME), JSON.stringify({ ...VALID, version: 2 }));
    assertFieldError(() => readConfig(root), /version/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('writeConfig validates before writing and leaves no file behind on invalid input', () => {
  const root = tempRoot();
  try {
    assertFieldError(() => writeConfig(root, { ...VALID, target: 'svelte' }), /target/);
    assert.equal(readConfig(root), null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('writeConfig never mutates the caller config', () => {
  const root = tempRoot();
  try {
    const config = deepFreeze(structuredClone(VALID));
    const before = JSON.stringify(config);
    validateConfig(config);
    writeConfig(root, config);
    assert.equal(JSON.stringify(config), before);
    assert.deepEqual(readConfig(root).config, VALID);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
