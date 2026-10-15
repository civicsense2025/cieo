import { test } from 'node:test';
import assert from 'node:assert/strict';

/* P3 probe: Select option-node cache goes stale on option-DOM replacement.
   Scenario (reviewer): open [A,B] -> replace DOM with [B,C] -> close.
   Buggy: close reuses cached [A,B]; B paints 0.147 while C stays '' (=1).
   Fixed: close re-resolves to live [B,C]; both paint uniformly. */

// Prefer the real resolver exported from the built component. Before the fix
// it does not exist, so fall back to a verbatim replica of the buggy inline
// logic (Select.tsx ~L140-146) to demonstrate the failure.
let resolveOptionNodes = null;
try {
  ({ resolveOptionNodes } = await import('../dist/controls/Select.js'));
} catch { /* pre-fix dist: no export */ }
if (typeof resolveOptionNodes !== 'function') resolveOptionNodes = null;

const buggyResolve = (box, cached, open) => {
  if (open) return [...box.querySelectorAll('[role="option"]')];
  if (cached.length === 0) return [...box.querySelectorAll('[role="option"]')];
  return cached;
};

const makeNode = (name) => ({ name, isConnected: true, style: { opacity: '' } });
const plate = () => ({ getAttribute: () => null });

const makeList = (live, counter) => ({
  querySelectorAll() {
    counter.n += 1;
    return [...live.current];
  },
  get children() {
    return [
      plate(),
      ...live.current.map((n) => ({ getAttribute: (k) => (k === 'role' ? 'option' : null) })),
    ];
  },
  contains(n) {
    return live.current.includes(n);
  },
});

/* Close-paint replica: target 0, so every painted option gets v (0.147). */
const paintClose = (items, v = 0.147) => {
  for (const n of items) n.style.opacity = v > 0.999 ? '' : v.toFixed(3);
};

test('P3 stale cache: post-replacement close paints all live options uniformly', () => {
  const resolve = resolveOptionNodes ?? buggyResolve;
  const A = makeNode('A');
  const B = makeNode('B');
  const C = makeNode('C');
  const live = { current: [A, B] };
  const counter = { n: 0 };
  const list = makeList(live, counter);

  let cache = resolve(list, [], true); // open [A,B]: single query
  assert.deepEqual(cache.map((n) => n.name), ['A', 'B']);
  assert.equal(counter.n, 1, 'open performs the single query');

  live.current = [B, C]; // option-DOM replacement while open
  A.isConnected = false;

  cache = resolve(list, cache, false); // close: must invalidate
  paintClose(cache);

  assert.equal(B.style.opacity, '0.147', 'B paints close value');
  assert.equal(
    C.style.opacity,
    '0.147',
    `C must paint uniformly with B (got ${JSON.stringify(C.style.opacity)})`,
  );
});

test('P3 perf guard: stable close reuses the per-open query (no re-query)', () => {
  const resolve = resolveOptionNodes ?? buggyResolve;
  const A = makeNode('A');
  const B = makeNode('B');
  const live = { current: [A, B] };
  const counter = { n: 0 };
  const list = makeList(live, counter);

  let cache = resolve(list, [], true);
  const afterOpen = counter.n;
  cache = resolve(list, cache, false); // stable close: no DOM change
  assert.equal(cache.map((n) => n.name).join(','), 'A,B');
  assert.equal(counter.n, afterOpen, 'stable close performs zero extra selector queries');
});
