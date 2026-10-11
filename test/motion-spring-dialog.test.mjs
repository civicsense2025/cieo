import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs'; import { Track } from '../dist/core/spring.js';
test('dialog stays mounted through exit', () => { const src = readFileSync('src/primitives/Dialog/Dialog.tsx','utf8'); assert.match(src, /const \{ mounted, ref \} = usePresence<HTMLDivElement>\(open \?\? false, \{ disabled: motion === false/); assert.match(src, /if \(!mounted\) return null/); assert.match(src, /ref=\{ref\}/); });
test('rapid toggle settles exactly once', () => { const tr = new Track(0); tr.set(1, { w: 22 }, 0); tr.set(0, { w: 34 }, 0.05); tr.set(1, { w: 22 }, 0.1); assert.equal(Math.round(tr.at(1000)), 1); assert.ok(tr.prune(1000) === 0); });
// NOTE: spec regex `/from: entering === 'fade' ? {...}/` cannot match the prescribed
// component (it passes `from: origin`); assert the equivalent: origin ternary picks
// ORIGINS.fade and the fade origin is y: 0.
test('entering choice selects presence origin', () => { const src = readFileSync('src/primitives/Dialog/Dialog.tsx','utf8'); assert.match(src, /entering === 'fade' \? ORIGINS\.fade/); assert.match(src, /fade: \{[^}]*y: 0/); assert.match(src, /from: origin/); });
