// Minimal React stub for useFlip continuity probing (jsdom-free).
// Faithfully simulates React's effect ordering: on dependency change, the
// previous cleanup runs BEFORE the next setup. Driver order is recorded in
// inst.order as 'cleanup'/'setup' markers so tests can assert the ordering.
export let current = null;

export function useRef(init) {
  const inst = current;
  const i = inst.cursor++;
  if (inst.hooks[i] === undefined) inst.hooks[i] = { current: init };
  return inst.hooks[i];
}

export function useState(init) {
  const inst = current;
  const i = inst.cursor++;
  if (inst.hooks[i] === undefined) {
    inst.hooks[i] = { v: typeof init === 'function' ? init() : init };
  }
  const slot = inst.hooks[i];
  return [slot.v, (nv) => { slot.v = typeof nv === 'function' ? nv(slot.v) : nv; }];
}

export function useCallback(fn) { return fn; }

function useEffectImpl(create, deps) {
  const inst = current;
  const i = inst.cursor++;
  let rec = inst.hooks[i];
  if (rec === undefined) {
    rec = { create, deps, cleanup: undefined, prevDeps: undefined };
    inst.hooks[i] = rec;
    inst.effects.push(rec);
  } else {
    rec.create = create;
    rec.deps = deps;
  }
}

export const useEffect = useEffectImpl;
export const useLayoutEffect = useEffectImpl;

// react/jsx-runtime surface (module is evaluated; useFlip path needs no JSX).
export function jsx() { return null; }
export function jsxs() { return null; }
export const Fragment = 'fragment';
export function jsxDEV() { return null; }

export function depsChanged(a, b) {
  if (a === undefined || b === undefined) return true;
  if (a.length !== b.length) return true;
  return a.some((d, k) => !Object.is(d, b[k]));
}

export function mount(renderFn) {
  const inst = { hooks: [], effects: [], cursor: 0, order: [] };
  current = inst;
  try { renderFn(); } finally { current = null; }
  for (const rec of inst.effects) {
    rec.cleanup = rec.create?.() ?? undefined;
    rec.prevDeps = rec.deps;
  }
  return inst;
}

// React ordering: cleanups of changed effects run BEFORE any setup.
export function update(inst, renderFn) {
  inst.cursor = 0;
  current = inst;
  try { renderFn(); } finally { current = null; }
  const changed = inst.effects.filter((rec) => depsChanged(rec.deps, rec.prevDeps));
  for (const rec of changed) {
    inst.order.push('cleanup');
    try { rec.cleanup?.(); } finally { rec.cleanup = undefined; }
  }
  for (const rec of changed) {
    inst.order.push('setup');
    rec.cleanup = rec.create?.() ?? undefined;
    rec.prevDeps = rec.deps;
  }
  return changed.length;
}

export function unmount(inst) {
  for (const rec of inst.effects) { try { rec.cleanup?.(); } finally { rec.cleanup = undefined; } }
}
