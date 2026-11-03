// tokens/tokens.json is the single motion source. Every hand-maintained copy (CSS, TS engine, Swift engine,
// Swift token mirror) must match it, so a value can never change on one platform only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const T = JSON.parse(read('tokens/tokens.json'));
const sec = (v) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v));
const num = (src, re, label) => {
  const m = src.match(re);
  assert.ok(m, `${label} not found`);
  return Number(m[1]);
};
const presets = Object.keys(T.spring);

test('tokens.css matches tokens.json', () => {
  const css = read('tokens/tokens.css').split('@media')[0];
  for (const p of presets) assert.equal(css.match(new RegExp(`--motion-duration-${p}:\\s*([^;]+);`))[1].trim(), T.spring[p].duration, p);
  assert.equal(css.match(/--motion-duration-exit:\s*([^;]+);/)[1].trim(), T.exit);
  assert.equal(css.match(/--motion-lag:\s*([^;]+);/)[1].trim(), T.lag);
  assert.equal(css.match(/--motion-stagger-max:\s*([^;]+);/)[1].trim(), T.staggerMax);
  assert.equal(Number(css.match(/--motion-arrive-opacity:\s*([^;]+);/)[1]), T.arriveOpacity);
  const norm = (s) => s.replace(/\s+/g, '');
  assert.equal(norm(css.match(/--motion-ease-spring:\s*([^;]+);/)[1]), norm(T.easeSpring));
  assert.equal(norm(css.match(/--motion-ease-exit:\s*([^;]+);/)[1]), norm(T.easeExit));
});

test('TS spring engine matches tokens.json', () => {
  const ts = read('src/core/spring.ts');
  for (const p of presets) assert.equal(num(ts, new RegExp(`\\b${p}:\\s*\\{\\s*w:\\s*([\\d.]+)`), `ts ${p}`), T.spring[p].w, p);
  assert.equal(num(ts, /EXIT\s*=\s*([\d.]+)/, 'EXIT'), sec(T.exit));
  assert.equal(num(ts, /LAG\s*=\s*([\d.]+)/, 'LAG'), sec(T.lag));
  assert.equal(num(ts, /STAGGER_MAX\s*=\s*([\d.]+)/, 'STAGGER_MAX'), sec(T.staggerMax));
  assert.equal(num(ts, /ARRIVE\s*=\s*([\d.]+)/, 'ARRIVE'), T.arriveOpacity);
});

test('Swift spring engine and MotionTokens match tokens.json', () => {
  const spring = read('Sources/Cieo/Spring.swift');
  const tokens = read('Sources/Cieo/Tokens.swift');
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  for (const p of presets) {
    assert.equal(num(spring, new RegExp(`static let ${p} = SpringPreset\\(w:\\s*([\\d.]+)\\)`), `swift ${p}`), T.spring[p].w, p);
    assert.equal(num(tokens, new RegExp(`duration${cap(p)}: Double = ([\\d.]+)`), `swift duration ${p}`), sec(T.spring[p].duration), p);
  }
  assert.equal(num(spring, /static let exit: Double = ([\d.]+)/, 'exit'), sec(T.exit));
  assert.equal(num(spring, /static let lag: Double = ([\d.]+)/, 'lag'), sec(T.lag));
  assert.equal(num(spring, /static let staggerMax: Double = ([\d.]+)/, 'staggerMax'), sec(T.staggerMax));
  assert.equal(num(spring, /static let arriveOpacity: Double = ([\d.]+)/, 'arriveOpacity'), T.arriveOpacity);
});

test('durations are the 99% settle time of each spring (6.64 / w), to the nearest 10ms', () => {
  for (const p of presets) {
    const { w, duration } = T.spring[p];
    assert.ok(Math.abs(sec(duration) - 6.64 / w) <= 0.01, `${p}: ${duration} vs ${(6.64 / w).toFixed(3)}s`);
  }
});

test('recipe runtime (atoms/web/runtime.core.js) matches tokens.json', () => {
  const rt = read('atoms/web/runtime.core.js');
  for (const p of presets) assert.equal(num(rt, new RegExp(`\\b${p}:\\s*\\{\\s*w:\\s*([\\d.]+)`), `runtime ${p}`), T.spring[p].w, p);
  assert.equal(num(rt, /\bEXIT = ([\d.]+)/, 'EXIT'), sec(T.exit));
  assert.equal(num(rt, /\bLAG = ([\d.]+)/, 'LAG'), sec(T.lag));
  assert.equal(num(rt, /\bSTAGGER_MAX = ([\d.]+)/, 'STAGGER_MAX'), sec(T.staggerMax));
});
