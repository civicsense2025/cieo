import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createTheme,
  toCSS,
  toDTCG,
  toNative,
  serializeTheme,
  parseTheme,
  variables,
  hexToOklch,
  oklchToHex,
  tonalRamp,
  toSwiftPresets,
} from '../design/index.js';
import { luminance } from '../design/color.js';

test('OKLCH conversions round-trip sRGB hex colors and build monotonic tonal ramps', () => {
  for (const sample of ['#000000', '#ffffff', '#595d17', '#6246c7', '#087977', '#b4432f', '#17150f']) {
    const lch = hexToOklch(sample);
    assert.ok(lch.l >= 0 && lch.l <= 1);
    assert.ok(lch.c >= 0);
    const back = oklchToHex(lch.l, lch.c, lch.h);
    assert.match(back, /^#[\da-f]{6}$/);
    assert.ok(Math.abs(luminance(sample) - luminance(back)) < 0.02, `${sample} -> ${back}`);
  }
  // Out-of-gamut chroma is clamped cleanly into valid 6-digit sRGB hex
  const clamped = oklchToHex(0.7, 0.45, 145);
  assert.match(clamped, /^#[\da-f]{6}$/);

  const ramp = tonalRamp('#6246c7');
  const stops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100];
  assert.deepEqual(Object.keys(ramp).map(Number), stops);
  assert.equal(ramp[0], '#000000');
  assert.equal(ramp[100], '#ffffff');
  for (let i = 1; i < stops.length; i += 1) {
    assert.ok(luminance(ramp[stops[i]]) >= luminance(ramp[stops[i - 1]]), `monotonic stop ${stops[i]}`);
  }
});

test('createTheme exposes 4-tier reference, surface container, state-layer, motion and physics tokens', () => {
  const theme = createTheme({ brand: 'instrument', ground: 'paper', zeta: 0.88 });
  assert.ok(theme.reference);
  assert.ok(theme.reference.accent[50]);
  assert.ok(theme.reference.neutral[95]);
  assert.equal(theme.options.zeta, 0.88);
  assert.equal(theme.tokens['motion-zeta'].value, 0.88);
  assert.equal(theme.tokens['motion-spring-snap-w'].value, 34);
  assert.equal(theme.tokens['motion-spring-base-w'].value, 22);
  assert.equal(theme.tokens['motion-duration-base'].type, 'duration');
  assert.equal(theme.tokens['motion-duration-base'].value, '300ms');
  assert.equal(theme.tokens['motion-duration-exit'].value, '100ms');
  assert.equal(theme.tokens['motion-lag'].value, '60ms');
  assert.equal(theme.tokens['physics-rubber-band'].value, 0.55);
  assert.equal(theme.tokens['physics-flick-velocity'].value, 450);
  assert.equal(theme.tokens['state-hover-opacity'].value, 0.08);
  assert.equal(theme.tokens['state-pressed-scale'].value, 0.98);
  assert.match(theme.tokens['color-surface-low'].value, /^#[\da-f]{6}$/);
  assert.match(theme.tokens['color-surface-high'].value, /^#[\da-f]{6}$/);
  assert.equal(theme.tokens['color-scrim'].value, '#000000');
  assert.equal(theme.tokens['scrim-alpha'].value, 0.45);
  assert.equal(theme.tokens['control-xs'].type, 'dimension');
  assert.equal(theme.tokens['control-xl'].type, 'dimension');

  // Default zeta is strictly 1.0 (critically damped); out-of-range zeta fails closed
  assert.equal(createTheme().tokens['motion-zeta'].value, 1);
  assert.throws(() => createTheme({ zeta: 0.5 }), RangeError);
  assert.throws(() => createTheme({ zeta: 1.1 }), RangeError);
});

test('DTCG and native exporters encode duration tokens cleanly and round-trip zeta/components', () => {
  const theme = createTheme({
    brand: 'lagoon',
    zeta: 0.9,
    components: { card: { radius: '20px', padding: '1.5rem' }, button: { height: '44px' } },
  });
  const { cieo } = toDTCG(theme);
  assert.deepEqual(cieo['motion-duration-base'].$value, { value: 300, unit: 'ms' });
  const vars = variables(theme);
  assert.equal(vars['--cieo-card-radius'], '20px');
  assert.equal(vars['--cieo-card-padding'], '1.5rem');
  assert.equal(vars['--cieo-button-height'], '44px');
  assert.match(toCSS(theme), /--cieo-card-radius: 20px;/);
  assert.equal(serializeTheme(parseTheme(serializeTheme(theme))), serializeTheme(theme));

  // Native swift export converts durations to seconds (0.3 for 300ms)
  const swift = toNative(theme, 'swift');
  assert.match(swift, /public static let motionDurationBase: Double = 0\.3/);

  // Reject unsafe component token keys or CSS injection values
  assert.throws(() => createTheme({ components: { 'bad key': { radius: '8px' } } }));
  assert.throws(() => createTheme({ components: { card: { radius: '8px;color:red' } } }));
});

test('toSwiftPresets emits all 7 brands, 3 grounds, 5 corner profiles and 3 densities', () => {
  const swiftSource = toSwiftPresets();
  for (const brand of ['studio', 'iris', 'lagoon', 'ember', 'rose', 'mono', 'instrument']) {
    assert.match(swiftSource, new RegExp(`case \\.${brand}:`));
  }
  for (const ground of ['cool', 'paper', 'mist']) {
    assert.match(swiftSource, new RegExp(`\\.${ground}: GroundPalette\\(`));
  }
  for (const corner of ['square', 'crisp', 'soft', 'round', 'pill']) {
    assert.match(swiftSource, new RegExp(`case \\.${corner}:`));
  }
});

test('CLI theme command accepts all 4-tier axes and wireEntry includes controls.css', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-cli-tier-'));
  const binPath = new URL('../bin/cieo.mjs', import.meta.url).pathname;
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', type: 'module' }));
    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: {} }));
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/main.tsx'), "import React from 'react';\n");
    execFileSync(
      process.execPath,
      [binPath, 'init', '--yes', '--target', 'vite', '--brand', 'instrument', '--no-starter', '--skip-install'],
      { cwd: dir, encoding: 'utf8' },
    );
    assert.match(readFileSync(join(dir, 'src/main.tsx'), 'utf8'), /import 'cieo\/controls\.css';/);
    execFileSync(
      process.execPath,
      [binPath, 'theme', 'brand=instrument', 'ground=paper', 'radius=pill', 'elevation=ring', 'contrast=high', 'zeta=0.9'],
      { cwd: dir, encoding: 'utf8' },
    );
    const updatedCss = readFileSync(join(dir, 'src/cieo-theme.css'), 'utf8');
    assert.match(updatedCss, /--cieo-motion-zeta: 0\.9;/);
    assert.match(updatedCss, /--cieo-radius-control: 9999px;/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
