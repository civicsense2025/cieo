'use client';
/* React bindings: thin hooks over the spring core and DOM helpers. They write to the DOM directly while
   something moves, so a spring never re-renders the component tree per frame. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type ReactNode, type RefObject } from 'react';
import { S, Track, allowed, config, now, run, state, type MotionKind, type Preset, type SpringConfig } from '../core/spring.js';
import { digits, edges, enter, exit, flip, swap, type Cancel, type PresenceOptions } from '../dom/index.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p: Preset | SpringConfig): SpringConfig => (typeof p === 'string' ? S[p] : p);

/** True while the user (or the app, via data-motion="reduced") asks for reduced motion. */
const reducedSubs = new Set<(v: boolean) => void>();
let reducedCached: boolean | null = null;
let reducedMedia: MediaQueryList | null = null;
let reducedObserver: MutationObserver | null = null;
/* One shared update for every mounted hook: N SwapTexts share one observer + two listeners. */
function updateReducedShared(): void {
  const next = state().reduced;
  if (next === reducedCached) return;
  reducedCached = next;
  [...reducedSubs].forEach((fn) => fn(next));
}
function subscribeReduced(fn: (v: boolean) => void): () => void {
  reducedSubs.add(fn);
  if (reducedSubs.size === 1) {
    reducedCached = state().reduced;
    fn(reducedCached);
    reducedMedia = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    reducedMedia?.addEventListener('change', updateReducedShared);
    reducedObserver = new MutationObserver(updateReducedShared);
    reducedObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
    document.addEventListener('motion:change', updateReducedShared);
  } else if (reducedCached !== null) {
    fn(reducedCached);
  }
  return () => {
    reducedSubs.delete(fn);
    if (!reducedSubs.size) {
      reducedMedia?.removeEventListener('change', updateReducedShared);
      reducedObserver?.disconnect();
      document.removeEventListener('motion:change', updateReducedShared);
      reducedMedia = null;
      reducedObserver = null;
      reducedCached = null;
    }
  };
}
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => reducedCached ?? false);
  useEffect(() => subscribeReduced(setReduced), []);
  return reduced;
}

export interface SpringOptions {
  preset?: Preset | SpringConfig;
  kind?: MotionKind;
  onSettle?: (value: number) => void;
}

/** Follows `target` with a critically damped spring and hands each frame to onFrame without re-rendering. Reduced motion jumps. */
export function useSpring(target: number, onFrame: (value: number) => void, opts: SpringOptions = {}): void {
  const frame = useRef(onFrame);
  frame.current = onFrame;
  const settle = useRef(opts.onSettle);
  settle.current = opts.onSettle;
  const track = useRef<Track | null>(null);
  const cancel = useRef<Cancel | null>(null);
  const quiet = useRef(false);
  const kind = opts.kind ?? 'feedback';
  const cfg = cfgOf(opts.preset ?? 'base');
  const emit = (v: number, settled: boolean) => {
    if (quiet.current) return;
    frame.current(v);
    if (settled) settle.current?.(v);
  };
  useIso(() => {
    quiet.current = false;
    if (!track.current) {
      track.current = new Track(target);
      frame.current(target);
      return;
    }
    const tr = track.current;
    if (!allowed(kind)) {
      quiet.current = true;
      cancel.current?.();
      quiet.current = false;
      tr.jump(target);
      emit(target, true);
      return;
    }
    tr.set(target, config(kind, cfg), now());
    if (!cancel.current) {
      cancel.current = run({
        kind,
        step: (t) => {
          emit(tr.at(t), false);
          return tr.prune(t) > 0;
        },
        finish: () => {
          cancel.current = null;
          tr.jump(tr.target);
          emit(tr.target, true);
        },
      });
    }
  }, [target, kind, cfg.w]);
  useEffect(
    () => () => {
      quiet.current = true;
      cancel.current?.();
    },
    [],
  );
}

/** Like useSpring but returns the value as state (re-renders per frame). Use for small, isolated readouts only. */
export function useSpringValue(target: number, opts: SpringOptions = {}): number {
  const [v, setV] = useState(target);
  useSpring(target, setV, opts);
  return v;
}

export interface Swap<T> {
  shown: T;
  leaving: T | null;
  key: number;
  done: (key: number) => void;
}

/** Holds the outgoing value while it exits; reduced motion skips the exit, and a timer clears it if no animation event arrives. */
export function useSwap<T>(value: T, fallbackMs = 700): Swap<T> {
  const reduced = useReducedMotion();
  const [s, setS] = useState<{ shown: T; leaving: T | null; key: number }>({ shown: value, leaving: null, key: 0 });
  /* Ledger: render-phase set lands the leaving value in the SAME commit, so the exit element exists for the exit
     animation. Moving this to an effect would commit one frame with the new value and no leaver (a flash and a
     lost exit), so the official derive-state-during-render pattern stays. No DOM reads are involved. */
  if (!Object.is(s.shown, value)) setS({ shown: value, leaving: reduced ? null : s.shown, key: s.key + 1 });
  const done = useCallback((key: number) => setS((p) => (p.key === key && p.leaving !== null ? { ...p, leaving: null } : p)), []);
  useEffect(() => {
    if (s.leaving === null) return;
    const id = setTimeout(() => done(s.key), fallbackMs);
    return () => clearTimeout(id);
  }, [s.leaving, s.key, done, fallbackMs]);
  return { ...s, done };
}

const SWAP_CSS = `.cieo-swap{display:inline-grid;vertical-align:baseline}.cieo-swap>*{grid-area:1/1}
.cieo-swap-out{pointer-events:none;animation:cieo-out var(--motion-duration-exit,100ms) cubic-bezier(.4,0,1,1) both}
.cieo-swap-in[data-swap]{animation:cieo-in var(--motion-duration-base,300ms) var(--motion-ease-spring,cubic-bezier(.2,.15,.2,1)) var(--motion-duration-exit,100ms) both}
@keyframes cieo-out{to{opacity:0;transform:translateY(calc(var(--motion-drift,4px)*-1))}}
@keyframes cieo-in{from{opacity:0;transform:translateY(var(--motion-drift,4px))}}
@media (prefers-reduced-motion:reduce){.cieo-swap-out,.cieo-swap-in[data-swap]{animation-duration:0s;animation-delay:0s}}`;
let swapCss = false;
function ensureSwapCss() {
  if (swapCss || typeof document === 'undefined') return;
  swapCss = true;
  const el = document.createElement('style');
  el.setAttribute('data-cieo', 'swap');
  el.textContent = SWAP_CSS;
  document.head.appendChild(el);
}

/** Text swap: the old value drifts up and fades out, then the new one fades in, in one grid cell so nothing reflows mid-swap. */
export function SwapText({ value, className, render }: { value: string | number; className?: string; render?: (v: string | number) => ReactNode }) {
  useIso(ensureSwapCss, []);
  const { shown, leaving, key, done } = useSwap(value);
  const draw = render ?? ((v: string | number) => v);
  const onEnd = (e: AnimationEvent<HTMLSpanElement>) => {
    if (e.target === e.currentTarget) done(key);
  };
  return (
    <span className={className ? `cieo-swap ${className}` : 'cieo-swap'}>
      {leaving !== null ? (
        <span key={`o${key}`} className="cieo-swap-out" aria-hidden="true">
          {draw(leaving)}
        </span>
      ) : null}
      <span key={`i${key}`} className="cieo-swap-in" data-swap={leaving !== null ? '' : undefined} onAnimationEnd={onEnd}>
        {draw(shown)}
      </span>
    </span>
  );
}

/** Rolling number: only changed digits roll, in the direction of change. The first render is instant. */
export function Digits({ value, className, kind }: { value: number | string; className?: string; kind?: MotionKind }) {
  const ref = useRef<HTMLSpanElement>(null);
  const initial = useRef(String(value));
  const first = useRef(true);
  useIso(() => {
    if (!ref.current) return;
    if (first.current) {
      first.current = false;
      return;
    }
    return digits(ref.current, value, { kind });
  }, [value]);
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {initial.current}
    </span>
  );
}

/** Text that swaps with the DOM helper whenever `value` changes (no wrapper markup left behind). */
export function useSwapEffect(ref: RefObject<Element | null>, value: string, opts?: { y?: number; blur?: number }): void {
  const first = useRef(true);
  useIso(() => {
    if (!ref.current) return;
    if (first.current) {
      first.current = false;
      ref.current.textContent = value;
      return;
    }
    return swap(ref.current, value, opts);
  }, [value]);
}

/** Sliding indicator: when `key` changes, the indicator springs from its old span with a leading and a lagging edge. */
export function useEdges(indicator: RefObject<Element | null>, key: unknown, opts?: { disabled?: boolean }): void {
  const last = useRef<{ left: number; right: number } | null>(null);
  useIso(() => {
    const el = indicator.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const prev = last.current;
    last.current = { left: r.left, right: r.right };
    if (prev && !opts?.disabled) return edges(el, prev, undefined);
  }, [key]);
}

/* Inline translate currently applied to a child (px units). flip() writes `translate(Xpx, Ypx)`,
   edges() writes `translateX(Xpx) ...`, and a 2D matrix() carries e/f; anything else (scale-only,
   foreign transforms) yields no offset so the stored destination is used as-is. Reads inline style
   only — never computed style — so this costs no layout. */
function flipOffset(el: Element): { x: number; y: number } {
  const t = (el as HTMLElement).style?.transform || '';
  if (!t) return { x: 0, y: 0 };
  let m = /translate\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)/.exec(t);
  if (m) return { x: +m[1], y: +m[2] };
  m = /translateX\(\s*(-?\d+(?:\.\d+)?)px\s*\)/.exec(t);
  if (m) return { x: +m[1], y: 0 };
  m = /matrix\(\s*[^,]+,[^,]+,[^,]+,[^,]+,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/.exec(t);
  if (m) return { x: +m[1], y: +m[2] };
  return { x: 0, y: 0 };
}

/** FLIP reflow: children of `container` slide from where they were to where they are after a render that changed `key`. */
export function useFlip(container: RefObject<Element | null>, key: unknown, opts?: { stagger?: number; clip?: Element }): void {
  /* No render-phase reads: all rect/transform reads below run in the layout effect, after commit.
     The stored map holds settled destinations, but a rapid retarget lands while the previous
     animation's residual translate is still applied — so the `before` passed to flip() is the
     stored destination reconciled with each child's live inline offset, read here before anything
     clears it. Without this the second animation starts from the previous destination
     instead of the on-screen position (a visible jump; landing is still correct). New children
     stay absent from `before` so flip() fades them in place from ARRIVE. The `before` Map contract
     for flip() is unchanged, as are STAGGER_MAX/ARRIVE/LAG semantics.
     Continuity ownership: the in-flight job is NEVER the keyed effect's cleanup. React runs
     cleanup before the next setup, which would clear the residual before flipOffset() reads it
     (a rapid retarget then restarts from the stale stored origin — a jump — or finds no move at
     all and snaps). The job is cancelled explicitly AFTER the live reads in the next setup, and
     on unmount only. */
  const prev = useRef<{ key: unknown; rects: Map<Element, DOMRect> } | null>(null);
  const job = useRef<Cancel | null>(null);
  useIso(() => {
    const el = container.current;
    if (!el) return;
    const changed = !prev.current || !Object.is(prev.current.key, key);
    const stored = changed ? (prev.current?.rects ?? null) : null;
    const kids = [...el.children];
    let before: Map<Element, DOMRect> | null = null;
    if (stored) {
      before = new Map();
      for (const kid of kids) {
        const b = stored.get(kid);
        if (!b) continue;
        const o = flipOffset(kid);
        before.set(kid, o.x || o.y ? new DOMRect(b.left + o.x, b.top + o.y, b.width, b.height) : b);
      }
    }
    /* Store clean destinations: the live rect still carries the residual reconciled above, so
       subtract it back off — otherwise the pollution compounds on the next retarget. */
    prev.current = {
      key,
      rects: new Map(
        kids.map((kid) => {
          const r = kid.getBoundingClientRect();
          const o = flipOffset(kid);
          return [kid, o.x || o.y ? new DOMRect(r.left - o.x, r.top - o.y, r.width, r.height) : r] as const;
        }),
      ),
    };
    if (!before) return;
    /* Cancel the previous job only after every live read above: its residual is what keeps
       `before` on the on-screen position. flip() would claim the same elements itself, but the
       explicit cancel also releases children removed from the container, which flip's claim
       loop over current children would no longer reach. Intentionally no effect cleanup is
       returned here (see ownership note above). */
    job.current?.();
    job.current = null;
    job.current = flip(el, () => {}, { ...opts, before });
  }, [key]);
  /* Unmount only: a key change must NOT cancel the running job (see ownership note above). */
  useIso(
    () => () => {
      job.current?.();
      job.current = null;
    },
    [],
  );
}

/** Mount/unmount with a shared enter/exit spring. Returns whether to render and a ref for the element. */
export function usePresence<T extends HTMLElement>(open: boolean, opts: PresenceOptions & { disabled?: boolean } = {}): { mounted: boolean; ref: RefObject<T | null> } {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<T>(null);
  const cancel = useRef<Cancel | null>(null);
  /* Ledger: render-phase sets mount the entering element (or unmount the disabled one) in the SAME commit the
     enter/exit effect below observes. Moving them to an effect would add a commit where [open, mounted] disagree
     and the enter/exit effect would start the wrong motion on it, so the derive-state-during-render pattern
     stays. No DOM reads are involved. */
  if (opts.disabled) {
    if (mounted !== open) setMounted(open);
  } else if (open && !mounted) setMounted(true);
  /* No cleanup per change: enter and exit retarget the element's one presence spring, so reversing is continuous. */
  useIso(() => {
    if (opts.disabled) return;
    const el = ref.current;
    if (!el) return;
    cancel.current = open ? enter(el, opts) : exit(el, { ...opts, done: () => setMounted(false) });
  }, [open, mounted]);
  useIso(() => () => cancel.current?.(), []);
  return { mounted, ref };
}

export { roveIndex, enabledIn, roveFocus, useDismiss, type RoveKey } from './interaction.js';
export { S, EXIT, LAG, ARRIVE, Track, allowed, now, resp, prog, setMotionState } from '../core/spring.js';
export type { Preset, SpringConfig, MotionKind } from '../core/spring.js';
