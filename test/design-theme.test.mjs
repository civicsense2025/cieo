import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTheme, auditTheme, brands, densities, radii, fonts, grounds, elevations, contrastRatio } from '../design/index.js';
import { readable, mix, channels } from '../design/color.js';

// Contrast depends on brand, scheme, contrast and ground. Corner, density, font and elevation choices only
// change dimensions and font stacks, so each matrix is walked on its own instead of multiplying into one huge product.
test('every brand, scheme, contrast and ground satisfies every advertised color pair', () => {
  let count = 0;
  for (const brand of Object.keys(brands)) for (const scheme of ['light', 'dark'])
    for (const contrast of ['standard', 'high']) for (const ground of Object.keys(grounds)) {
      const theme = createTheme({ brand, scheme, contrast, ground });
      assert.equal(auditTheme(theme).length, 32);
      assert.ok(auditTheme(theme).every((result) => result.pass), `${brand} ${scheme} ${contrast} ${ground}`); count += 1;
    }
  assert.equal(count, 7 * 2 * 2 * 3);
});

test('every density, corner, font and elevation choice builds a complete theme', () => {
  let count = 0;
  for (const density of Object.keys(densities)) for (const radius of Object.keys(radii)) for (const font of Object.keys(fonts))
    for (const elevation of Object.keys(elevations)) {
      const theme = createTheme({ density, radius, font, elevation, brand: 'instrument', ground: 'paper' });
      assert.equal(Object.keys(theme.tokens).length, 106);
      assert.ok(auditTheme(theme).every((result) => result.pass)); count += 1;
    }
  assert.equal(count, 3 * 5 * 3 * 2);
});

test('the pill corner makes controls fully round and leaves cards gently rounded', () => {
  const t = createTheme({ radius: 'pill' });
  assert.equal(t.tokens['radius-control'].value, '9999px');
  assert.equal(t.tokens['radius-surface'].value, '18px');
  assert.equal(t.tokens['radius-small'].value, '6px');
});

test('headings always use the UI sans stack: there is no serif display face to choose', () => {
  const plain = createTheme();
  assert.deepEqual(plain.tokens['font-display'].value, plain.tokens['font-sans'].value);
  assert.throws(() => createTheme({ display: 'serif' }), /display/);
  assert.ok(![plain, createTheme({ font: 'humanist' }), createTheme({ font: 'mono' })].some((t) => t.tokens['font-display'].value.some((f) => /Iowan|Palatino|Georgia|^serif$/.test(f))));
  assert.deepEqual(createTheme({ font: 'humanist' }).tokens['font-display'].value, createTheme({ font: 'humanist' }).tokens['font-sans'].value);
});

test('ring elevation draws a hairline with a small lift, and soft elevation draws none', () => {
  const soft = createTheme(), ring = createTheme({ elevation: 'ring' });
  assert.equal(soft.tokens['ring-width'].value, '0px');
  assert.equal(ring.tokens['ring-width'].value, '1px');
  assert.ok(parseFloat(ring.tokens['shadow-blur'].value) < parseFloat(soft.tokens['shadow-blur'].value));
  assert.ok(ring.tokens['shadow-alpha'].value < soft.tokens['shadow-alpha'].value);
  const css = readFileSync('design/styles/layout.css', 'utf8');
  assert.match(css, /data-elevation='raised'\] \{ box-shadow: 0 0 0 var\(--cieo-ring-width\)/);
});

test('grounds differ in warmth but never in contrast: paper is warm, mist is cool gray, cool is the default', () => {
  const warm = (g) => { const [r, , b] = channels(createTheme({ ground: g }).tokens['color-canvas'].value); return r - b; };
  assert.ok(warm('paper') > warm('cool'), 'paper leans warm');
  assert.ok(warm('mist') <= warm('cool') + 2, 'mist stays cool');
  assert.equal(createTheme().options.ground, 'cool');
});

test('unknown ground and elevation choices are refused by name', () => {
  for (const [key, value] of [['ground', 'sepia'], ['elevation', 'glow']]) assert.throws(() => createTheme({ [key]: value }), new RegExp(`Invalid ${key}`));
});

test('custom seeds remain readable instead of silently emitting inaccessible accent fills', () => {
  for (const accent of ['#ffffff', '#000000', '#777777', '#00ffff', '#ffff00', '#ff0000', '#0000ff', '#123456', '#abcdef']) {
    for (const scheme of ['light', 'dark']) for (const contrast of ['standard', 'high']) {
      assert.ok(auditTheme(createTheme({ accent, scheme, contrast })).every((result) => result.pass));
    }
  }
});
test('WCAG sRGB reference ratios and identity cases are exact', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#123456', '#123456'), 1);
  assert.deepEqual(channels('#ff0080'), [1, 0, 128 / 255]);
  assert.equal(mix('#000000', '#ffffff', .5), '#808080');
  assert.ok(contrastRatio(readable('#aaaaaa', '#ffffff', 7), '#ffffff') >= 7);
  assert.throws(() => readable('#777777', '#777777', 21), RangeError);
});
test('semantic status colors remain independent of brand identity', () => {
  const first = createTheme({ brand: 'studio' }), second = createTheme({ brand: 'iris' });
  for (const status of ['success', 'warning', 'danger', 'info']) assert.equal(first.tokens[`color-${status}`].value, second.tokens[`color-${status}`].value);
  assert.notEqual(first.tokens['color-accent'].value, second.tokens['color-accent'].value);
});
test('themes are deeply immutable and do not freeze caller-owned arrays', () => {
  const stack = ['Example Sans', 'sans-serif'];
  const theme = createTheme({ overrides: { 'font-sans': stack } });
  stack.push('serif');
  assert.equal(theme.tokens['font-sans'].value.length, 2);
  assert.ok(Object.isFrozen(theme.tokens['font-sans'].value));
  assert.throws(() => { theme.tokens['color-text'].value = '#ffffff'; });
});
test('unknown options, unsafe values, and invalid overrides fail closed', () => {
  for (const input of [null, [], { brand: 'unknown' }, { scheme: null }, { overrides: null }, { accent: 'red' }, { accent: '#fff' }, { accent: '#ffffff00' }, { secret: true }]) assert.throws(() => createTheme(input));
  for (const overrides of [{ missing: 1 }, { 'space-2': '-1px' }, { 'space-2': 'url(x)' }, { 'space-2': '10001px' }, { 'font-sans': ['A";color:red'] }, { 'weight-normal': Infinity }, { 'shadow-alpha': 2 }, { 'weight-normal': 0 }, { 'color-text': '#ffffff' }]) assert.throws(() => createTheme({ overrides }));
  assert.throws(() => createTheme(JSON.parse('{"__proto__":{"polluted":true}}')));
  assert.equal({}.polluted, undefined);
});
test('density and corner choices change only their intended dimensional roles', () => {
  const a = createTheme({ density: 'compact', radius: 'crisp' });
  const b = createTheme({ density: 'spacious', radius: 'round' });
  assert.equal(a.tokens['control-height'].value, '2rem'); assert.equal(b.tokens['control-height'].value, '3rem');
  assert.equal(a.tokens['touch-target'].value, '44px'); assert.equal(b.tokens['touch-target'].value, '44px');
  assert.equal(a.tokens['radius-control'].value, '4px'); assert.equal(b.tokens['radius-control'].value, '16px');
  assert.equal(a.tokens['color-accent'].value, b.tokens['color-accent'].value);
});
