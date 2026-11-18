/* Shared DOM paint, style-restoration hold, and per-element motion ownership. */
import { STAGGER_MAX, clamp, now, run, type MotionKind } from '../core/spring.js';

export type Cancel = () => void;
export type Targets = string | Element | Iterable<Element> | null | undefined;

const PROPS = ['transform', 'transform-origin', 'opacity', 'filter', 'clip-path', 'visibility', 'will-change'];
export const owners = new WeakMap<Element, Cancel>();
export const noop: Cancel = () => {};
export const st = (el: Element): CSSStyleDeclaration => (el as HTMLElement).style;

export const list = (x: Targets): Element[] =>
  typeof x === 'string' ? [...document.querySelectorAll(x)] : x instanceof Element ? [x] : [...(x || [])];
export const gapFor = (n: number, gap?: number): number => Math.min(gap || 0, STAGGER_MAX / Math.max(1, n - 1));

let liveEls = 0;
const BLUR_WIDE_PX = 800;
const BLUR_MAX_ELS = 8;
const BLUR_EPS = 0.05;
type PaintLast = { o: number; x: number; y: number; sc: number; b: number; oClear: boolean; tClear: boolean; fClear: boolean };
const lastPaint = new WeakMap<Element, PaintLast>();
const wideCache = new WeakMap<Element, number>();

function blurOK(el: Element): boolean {
  if (liveEls > BLUR_MAX_ELS) return false;
  let w = wideCache.get(el);
  if (w === undefined) {
    try {
      w = (el as HTMLElement).offsetWidth || el.getBoundingClientRect().width;
    } catch {
      w = 0;
    }
    wideCache.set(el, w);
  }
  return w <= BLUR_WIDE_PX;
}

/** Saves the inline values this module may write and returns a function that puts them back. */
export function hold(el: Element, moving = true): () => void {
  const hadStyle = el.hasAttribute('style');
  const s = st(el);
  const saved = PROPS.map((p) => [p, s.getPropertyValue(p), s.getPropertyPriority(p)] as const);
  if (moving) s.willChange = 'transform, opacity';
  return () => {
    saved.forEach(([p, v, priority]) => (v ? s.setProperty(p, v, priority) : s.removeProperty(p)));
    if (!hadStyle && !el.getAttribute('style')) el.removeAttribute('style');
    /* Paint caches reflect inline values; the restore above invalidates them. */
    lastPaint.delete(el);
    wideCache.delete(el);
  };
}

/** One motion per element: claiming finishes any earlier motion on it first. */
export function animate(els: Element[], job: { kind?: MotionKind; step: (t: number) => boolean | void; finish?: () => void }): Cancel {
  els = [...new Set(els)];
  els.forEach((el) => owners.get(el)?.());
  const releases = els.map((el) => hold(el));
  liveEls += els.length;
  let finished = false;
  let stop: Cancel = noop;
  const cancel: Cancel = () => { stop(); done(); };
  const done = () => {
    if (finished) return;
    finished = true;
    liveEls = Math.max(0, liveEls - els.length);
    let failure: unknown;
    let failed = false;
    for (const release of releases) {
      try { release(); } catch (error) { if (!failed) { failed = true; failure = error; } }
    }
    els.forEach((el) => {
      if (owners.get(el) === cancel) owners.delete(el);
    });
    try { job.finish?.(); } catch (error) { if (!failed) { failed = true; failure = error; } }
    if (failed) throw failure;
  };
  // Ownership precedes run because reduced-motion completion can happen synchronously.
  els.forEach((el) => owners.set(el, cancel));
  try {
    job.step(now());
    if (!finished) stop = run({ kind: job.kind, step: job.step, finish: done });
  } catch (error) {
    try { done(); } catch { /* Preserve the initiating failure after releasing the touched styles. */ }
    throw error;
  }
  return cancel;
}

export function paint(el: Element, o: number, y = 0, blur = 0, x = 0, scale = 1): void {
  const s = st(el);
  const oClear = o > 0.999;
  const tClear = Math.abs(x) < 0.01 && Math.abs(y) < 0.01 && Math.abs(scale - 1) < 0.0005;
  let b = blur;
  if (b > BLUR_EPS && !blurOK(el)) b = 0;
  const fClear = b <= BLUR_EPS;
  const last = lastPaint.get(el);
  /* Identity paints explicitly: a cleared inline would let author stylesheets leak through. */
  const oStr = clamp(o).toFixed(3);
  const tStr = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
  if (!last) {
    s.opacity = oStr;
    s.transform = tStr;
    if (fClear) {
      s.filter = 'none';
    } else {
      s.filter = `blur(${b.toFixed(2)}px)`;
      s.willChange = 'transform, opacity, filter';
    }
    lastPaint.set(el, { o, x, y, sc: scale, b, oClear, tClear, fClear });
    return;
  }
  if (oClear !== last.oClear || Math.abs(o - last.o) >= 0.0005) {
    s.opacity = oStr;
    last.o = o;
    last.oClear = oClear;
  }
  if (tClear !== last.tClear || Math.abs(x - last.x) >= 0.01 || Math.abs(y - last.y) >= 0.01 || Math.abs(scale - last.sc) >= 0.0005) {
    s.transform = tStr;
    last.x = x;
    last.y = y;
    last.sc = scale;
    last.tClear = tClear;
  }
  if (fClear !== last.fClear || Math.abs(b - last.b) >= BLUR_EPS) {
    if (fClear) {
      s.filter = 'none';
    } else {
      s.filter = `blur(${b.toFixed(2)}px)`;
      s.willChange = 'transform, opacity, filter';
    }
    last.b = b;
    last.fClear = fClear;
  }
}

export interface From {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blur: number;
}

export const paintFrom = (el: Element, p: number, f: From): void => {
  const q = 1 - p;
  paint(el, f.opacity + (1 - f.opacity) * p, f.y * q, f.blur * q, f.x * q, f.scale + (1 - f.scale) * p);
};
