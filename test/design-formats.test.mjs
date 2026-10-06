import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createTheme, toCSS, toDTCG, toPortable, toNative, serializeTheme, parseTheme, variables, themeSchema } from '../design/index.js';

test('configuration round-trips losslessly and exports deterministically', () => {
  const theme = createTheme({ brand: 'rose', scheme: 'dark', density: 'compact', overrides: { 'space-4': '2rem', 'radius-control': '3px' } });
  assert.equal(serializeTheme(parseTheme(serializeTheme(theme))), serializeTheme(theme));
  assert.equal(toCSS(theme), toCSS(parseTheme(serializeTheme(theme))));
  assert.ok(toCSS(theme, '.my-app').startsWith('.my-app {'));
  assert.ok(toCSS(theme, '[data-cieo-theme="my-app"]').includes('--cieo-color-accent'));
});
test('DTCG color, dimension, family, weight and number encodings preserve explicit types', () => {
  const theme = createTheme(), { cieo } = toDTCG(theme);
  assert.deepEqual(cieo['space-2'].$value, { value: .5, unit: 'rem' });
  assert.equal(cieo['color-text'].$type, 'color');
  assert.equal(cieo['color-text'].$value.colorSpace, 'srgb');
  assert.equal(cieo['color-text'].$value.alpha, 1);
  assert.equal(cieo['color-text'].$value.components.length, 3);
  assert.ok(Array.isArray(cieo['font-sans'].$value));
  assert.equal(cieo['weight-normal'].$type, 'fontWeight');
  assert.equal(cieo['leading-body'].$type, 'number');
  assert.equal(Object.keys(cieo).length, Object.keys(theme.tokens).length);
  assert.deepEqual(toPortable(theme).tokens, cieo);
  assert.equal(toPortable(theme).referenceFontSize, 16);
});
test('exporters reject spoofed themes and CSS selector injection', () => {
  for (const fn of [variables, toCSS, toDTCG, toPortable, serializeTheme, (theme) => toNative(theme, 'swift')]) assert.throws(() => fn({ tokens: {} }), TypeError);
  const theme = createTheme();
  for (const selector of ['body *', ':root}body{color:red', '</style>', '[data-x="x"]', '#a:hover']) assert.throws(() => toCSS(theme, selector));
});
test('configuration parsing enforces schema version, shape and UTF-8 size', () => {
  for (const value of ['null', '{}', '[]', '{"version":2,"options":{}}', '{"version":1,"options":{},"other":true}', 'x'.repeat(32769), ' '.repeat(32760) + 'é'.repeat(20)]) assert.throws(() => parseTheme(value));
  const schema = themeSchema();
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.options.properties.overrides.additionalProperties, false);
  assert.equal(Object.keys(schema.properties.options.properties.overrides.properties).length, 73);
});
test('native exporters preserve dimensions, deterministic names and caller-selected reference size', () => {
  const theme = createTheme();
  for (const target of ['swift', 'rust', 'kotlin', 'dart', 'python', 'c']) {
    assert.ok(toNative(theme, target).includes('Cieo tokens'));
    assert.ok(toNative(theme, target, { namespace: 'ExampleTokens', referenceFontSize: 20 }).includes('10.0'));
    assert.throws(() => toNative(theme, target, { namespace: 'Self' }));
    assert.throws(() => toNative(theme, target, { namespace: 'Bad;Code' }));
    assert.throws(() => toNative(theme, target, { referenceFontSize: NaN }));
  }
  assert.throws(() => toNative(theme, 'unknown'));
  assert.match(toNative(theme, 'c'), /#ifndef CIEO_DESIGN_TOKENS_H/);
});
test('CLI output is machine-readable and failures exit nonzero without artifact output', () => {
  const options = { cwd: new URL('..', import.meta.url), encoding: 'utf8' };
  const config = execFileSync(process.execPath, ['scripts/export-theme.mjs', 'config'], options);
  const result = execFileSync(process.execPath, ['scripts/export-theme.mjs', 'json', '-'], { ...options, input: config });
  assert.equal(JSON.parse(result).version, 1);
  assert.throws(() => execFileSync(process.execPath, ['scripts/export-theme.mjs', 'unknown'], { ...options, stdio: 'pipe' }));
});
