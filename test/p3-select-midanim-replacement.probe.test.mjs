import { test } from 'node:test';
import assert from 'node:assert/strict';

/* P3 round-2 probe: Select presence painter goes stale mid-animation.
   Scenario (re-reviewer): open [A,B], replace option DOM with [B,C], then
   close while the opening job is still running.
   Buggy (Select.tsx @8dc0378 L167+L222-228): the effect snapshots
   `const items = optionCache.current` and the already-running job keeps
   painting that closed-over array. Refreshing optionCache.current on close
   does not reach the live painter: B paints 0.147, C stays '' (=1).
   Fixed: the per-frame paint reads the holder (optionCache.current) live,
   with per-node (not per-index) last-painted state, so the running job
   picks up the refreshed [B,C] list on its very next frame. */

// Prefer the real exports from the built component. Before the fix
// paintLiveOptions does not exist, so fall back to a verbatim replica of the
// buggy snapshot wiring (Select.tsx ~L167 + option loop ~L222-228) to
// demonstrate the failure.
let resolveOptionNodes = null;
let paintLiveOptions = null;
try {
  ({ resolveOptionNodes, paintLiveOptions } = await import('../dist/controls/Select.js'));
} catch { /* pre-fix dist: no export */ }
if (typeof resolveOptionNodes !== 'function') resolveOptionNodes = null;

const buggyResolve = (box, cached, open) => {
  if (open) return [...box.querySelectorAll('[role="option"]')];
  if (cached.length === 0) return [...box.querySelectorAll('[role="option"]')];
  return cached;
};

/* Verbatim replica of the pre-fix running job: it closes over the
   effect-time `snapshot` array, so a later cache refresh never reaches it. */
const makeBuggyJob = (snapshot) => {
  const lastQ = new Array(snapshot.length).fill(-1);
  return {
    frame: (qFor) => {
      for (let i = 0; i < snapshot.length; i += 1) {
        const q = qFor(i);
        if (Math.abs(q - lastQ[i]) < 0.0005 && (q > 0.999) === (lastQ[i] > 0.999)) continue;
        snapshot[i].style.opacity = q > 0.999 ? '' : q.toFixed(3);
        lastQ[i] = q;
      }
    },
  };
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
      ...live.current.map(() => ({ getAttribute: (k) => (k === 'role' ? 'option' : null) })),
    ];
  },
  contains(n) {
    return live.current.includes(n);
  },
});

test('P3 round-2: close-during-opening paints the refreshed nodes, not the snapshot', () => {
  const resolve = resolveOptionNodes ?? buggyResolve;
  const A = makeNode('A');
  const B = makeNode('B');
  const C = makeNode('C');
  const live = { current: [A, B] };
  const counter = { n: 0 };
  const list = makeList(live, counter);

  /* holder stands in for the optionCache ref (stable ref object, mutable .current). */
  const holder = { current: [] };

  /* open [A,B]: single fresh query, opening frame paints A and B. */
  holder.current = resolve(list, holder.current, true);
  assert.deepEqual(holder.current.map((n) => n.name), ['A', 'B']);
  assert.equal(counter.n, 1, 'open performs the single query');

  if (typeof paintLiveOptions !== 'function') {
    /* PRE-FIX path: the running job snapshots `items` at effect time. */
    const job = makeBuggyJob(holder.current);
    job.frame(() => 0.6);
    assert.equal(A.style.opacity, '0.600');
    assert.equal(B.style.opacity, '0.600');

    /* option-DOM replacement while the opening job is still running. */
    live.current = [B, C];
    A.isConnected = false;

    /* close refreshes the cache, but the running job keeps its snapshot. */
    holder.current = resolve(list, holder.current, true);
    job.frame(() => 0.147);

    assert.equal(B.style.opacity, '0.147', 'B paints close value');
    assert.equal(
      C.style.opacity,
      '0.147',
      `STALE PAINTER: running job kept the open-time snapshot; C never painted (got ${JSON.stringify(C.style.opacity)})`,
    );
    return;
  }

  /* POST-FIX path: every frame reads holder.current live, like the component. */
  const state = new Map();
  paintLiveOptions(holder, state, () => 0.6);
  assert.equal(A.style.opacity, '0.600');
  assert.equal(B.style.opacity, '0.600');

  /* option-DOM replacement while the opening job is still running. */
  live.current = [B, C];
  A.isConnected = false;

  /* close during opening: refresh must re-query (cache invalidated)... */
  const beforeClose = counter.n;
  holder.current = resolve(list, holder.current, false);
  assert.deepEqual(holder.current.map((n) => n.name), ['B', 'C']);
  assert.equal(counter.n, beforeClose + 1, 'replacement invalidates the cache: close re-queries once');

  /* ...and the SAME running job's next frame paints the refreshed list. */
  paintLiveOptions(holder, state, () => 0.147);
  assert.equal(B.style.opacity, '0.147', 'B paints close value');
  assert.equal(
    C.style.opacity,
    '0.147',
    `C must paint uniformly with B (got ${JSON.stringify(C.style.opacity)})`,
  );
});

test('P3 round-2: per-node paint state survives replacement (no index drift, no leak)', () => {
  if (typeof paintLiveOptions !== 'function') {
    assert.fail('SKIP-RED: paintLiveOptions not exported yet (covered by the stale-painter test above)');
  }
  const A = makeNode('A');
  const B = makeNode('B');
  const C = makeNode('C');
  const holder = { current: [A, B] };
  const state = new Map();

  paintLiveOptions(holder, state, () => 0.6);
  assert.equal(state.size, 2, 'one entry per live node');

  /* [A,B] -> [B,C]: B keeps its identity (index 1 -> 0); C is new. */
  holder.current = [B, C];
  B.isConnected = true;
  A.isConnected = false;
  paintLiveOptions(holder, state, () => 0.147);
  assert.equal(B.style.opacity, '0.147');
  assert.equal(C.style.opacity, '0.147');
  assert.equal(state.size, 2, 'detached A is pruned, not retained');
  assert.equal(state.has(A), false, 'no stale entry for the removed node');
});
