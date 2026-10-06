import test from 'node:test';
import assert from 'node:assert/strict';
import { createTheme, auditTheme, brands, densities, radii, fonts, contrastRatio } from '../design/index.js';
import { readable, mix, channels } from '../design/color.js';

test('all 648 supported theme combinations satisfy every advertised color pair', () => {
  let count = 0;
  for (const brand of Object.keys(brands)) for (const scheme of ['light', 'dark'])
    for (const density of Object.keys(densities)) for (const radius of Object.keys(radii))
      for (const contrast of ['standard', 'high']) for (const font of Object.keys(fonts)) {
        const theme = createTheme({ brand, scheme, density, radius, contrast, font });
        assert.equal(Object.keys(theme.tokens).length, 73);
        assert.equal(auditTheme(theme).length, 32);
        assert.ok(auditTheme(theme).every((result) => result.pass)); count += 1;
      }
  assert.equal(count, 648);
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
