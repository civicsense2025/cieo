/* Popup presence and highlight-plate motion helpers for Select. */
import { BLUR, LAG, S, STAGGER_MAX, Track, active as activeJobs, allowed, clamp, config, now, prog, run } from '../core/spring.js';
import { px } from './motion.js';

const OPTION_SELECTOR = '[role="option"]';

/* Resolve the option nodes to paint. Open always takes one fresh query; close
   reuses the cache only when every cached node is still connected and contained
   and the live option count is unchanged. */
export function resolveOptionNodes(box: HTMLDivElement | null, cached: HTMLElement[], open: boolean): HTMLElement[] {
  if (!box) return cached;
  if (open || cached.length === 0) return [...box.querySelectorAll<HTMLElement>(OPTION_SELECTOR)];
  for (const n of cached) {
    if (!n.isConnected || !box.contains(n)) return [...box.querySelectorAll<HTMLElement>(OPTION_SELECTOR)];
  }
  let liveCount = 0;
  const kids = box.children;
  for (let i = 0; i < kids.length; i += 1) {
    if (kids[i].getAttribute('role') === 'option') liveCount += 1;
  }
  if (liveCount !== cached.length) return [...box.querySelectorAll<HTMLElement>(OPTION_SELECTOR)];
  return cached;
}

export const optionGap = (n: number): number => Math.min(0.03, STAGGER_MAX / Math.max(1, n - 1));

export function paintLiveOptions(
  holder: { current: HTMLElement[] },
  lastQ: Map<HTMLElement, number>,
  qFor: (index: number) => number,
): void {
  const nodes = holder.current;
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const prev = lastQ.get(node) ?? -1;
    const q = qFor(i);
    if (Math.abs(q - prev) < 0.0005 && (q > 0.999) === (prev > 0.999)) continue;
    node.style.opacity = q > 0.999 ? '' : q.toFixed(3);
    lastQ.set(node, q);
  }
  if (lastQ.size > nodes.length) {
    const live = new Set(nodes);
    for (const key of lastQ.keys()) if (!live.has(key)) lastQ.delete(key);
  }
}

export interface SelectPresenceState {
  o: Track;
  t0: number;
  stop: (() => void) | null;
}

export function syncSelectPopup(params: {
  pop: HTMLDivElement | null;
  list: HTMLDivElement | null;
  trigger: HTMLButtonElement | null;
  open: boolean;
  side: 'bottom' | 'top';
  presence: SelectPresenceState;
  optionCache: { current: HTMLElement[] };
}): void {
  const { pop: el, list, trigger, open, side, presence: p, optionCache } = params;
  if (!el) return;
  if (open) {
    p.t0 = now();
    if (list) optionCache.current = resolveOptionNodes(list, optionCache.current, true);
  } else if (list) {
    optionCache.current = resolveOptionNodes(list, optionCache.current, false);
  }
  const up = side === 'top' ? 1 : -1;
  let lastV = -1;
  let lastVis = '';
  let lastOClear = false;
  let lastTClear = false;
  let lastFClear: boolean | null = null;
  let popW = -1;
  const lastQ = new Map<HTMLElement, number>();
  const paint = (t: number) => {
    const v = clamp(p.o.at(t));
    const vis = v < 0.01 && !p.o.target ? 'hidden' : 'visible';
    if (vis !== lastVis) {
      el.style.visibility = vis;
      lastVis = vis;
    }
    const vMoved = lastV < 0 || Math.abs(v - lastV) >= 0.0005;
    if (vMoved) {
      const oClear = v > 0.999;
      if (oClear !== lastOClear || vMoved) {
        /* The closed stylesheet is opacity: 0; clearing here would hide an open popup. */
        el.style.opacity = oClear ? '1' : v.toFixed(3);
        lastOClear = oClear;
      }
      const tClear = v > 0.999;
      if (tClear !== lastTClear || vMoved) {
        el.style.transform = tClear ? '' : `translateY(${px((1 - v) * 4 * up)}) scale(${(0.97 + 0.03 * v).toFixed(4)})`;
        lastTClear = tClear;
      }
      let wantBlur = v < 0.98;
      if (wantBlur) {
        if (popW < 0) {
          try {
            popW = el.offsetWidth || el.getBoundingClientRect().width;
          } catch {
            popW = 0;
          }
        }
        if (popW > 800 || activeJobs() > 8) wantBlur = false;
      }
      const fClear = !wantBlur;
      if (fClear !== lastFClear || (wantBlur && vMoved)) {
        el.style.filter = fClear ? '' : `blur(${((1 - v) * BLUR).toFixed(2)}px)`;
        lastFClear = fClear;
      }
      lastV = v;
    }
    const nodes = optionCache.current;
    const gap = optionGap(nodes.length);
    paintLiveOptions(optionCache, lastQ, (i) => (p.o.target ? clamp(prog(t, p.t0 + 0.04 + i * gap, S.base)) : v));
  };
  if (!allowed('feedback', trigger)) {
    p.stop?.();
    p.o.jump(open ? 1 : 0);
    p.t0 = -9;
    paint(now());
    return;
  }
  p.o.set(open ? 1 : 0, config('feedback', open ? S.base : S.snap));
  if (!p.stop)
    p.stop = run({
      kind: 'feedback',
      step: (t) => {
        paint(t);
        const live = optionCache.current.length;
        return p.o.prune(t) > 0 || (!!p.o.target && t < p.t0 + 0.04 + live * optionGap(live) + 0.3);
      },
      finish: () => {
        p.stop = null;
        p.o.jump(p.o.target);
        p.t0 = -9;
        paint(now());
      },
    });
}

export interface SelectPlateState {
  top: Track;
  bottom: Track;
  stop: (() => void) | null;
  shown: boolean;
}

export function syncSelectPlate(params: {
  plate: HTMLDivElement | null;
  list: HTMLDivElement | null;
  activeId: string;
  open: boolean;
  keyboard: boolean;
  edges: SelectPlateState;
}): void {
  const { plate: el, list: box, activeId, open, keyboard, edges: e } = params;
  if (!el || !box) return;
  const row = document.getElementById(activeId);
  if (!open || !row) {
    e.shown = false;
    el.style.opacity = '0';
    return;
  }
  const top = row.offsetTop;
  const bottom = top + row.offsetHeight;
  const paint = (t: number) => {
    const a = e.top.at(t);
    el.style.transform = `translateY(${px(a)})`;
    el.style.height = px(Math.max(0, e.bottom.at(t) - a));
  };
  el.style.opacity = '1';
  if (keyboard) row.scrollIntoView?.({ block: 'nearest' });
  if (!e.shown || !allowed('feedback', el)) {
    e.shown = true;
    e.stop?.();
    e.top.jump(top);
    e.bottom.jump(bottom);
    paint(now());
    return;
  }
  const t0 = now();
  const down = top >= e.top.target;
  const cfg = config('feedback', S.base);
  (down ? e.bottom : e.top).set(down ? bottom : top, cfg, t0);
  (down ? e.top : e.bottom).set(down ? top : bottom, cfg, t0 + LAG);
  if (!e.stop)
    e.stop = run({
      kind: 'feedback',
      step: (t) => {
        paint(t);
        return e.top.prune(t) + e.bottom.prune(t) > 0;
      },
      finish: () => {
        e.stop = null;
        e.top.jump(e.top.target);
        e.bottom.jump(e.bottom.target);
        paint(now());
      },
    });
}
