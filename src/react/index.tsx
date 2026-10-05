'use client';
/* React bindings: thin hooks over the spring core and DOM helpers. They write to the DOM directly while
   something moves, so a spring never re-renders the component tree per frame. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type ReactNode, type RefObject } from 'react';
import { S, Track, allowed, config, now, run, state, type MotionKind, type Preset, type SpringConfig } from '../core/spring.js';
import { digits, edges, enter, exit, flip, swap, type Cancel, type PresenceOptions } from '../dom/index.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p: Preset | SpringConfig): SpringConfig => (typeof p === 'string' ? S[p] : p);

/** True while the user (or the app, via data-motion="reduced") asks for reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const update = () => setReduced(state().reduced);
    update();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new MutationObserver(update);
    media.addEventListener('change', update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
    document.addEventListener('motion:change', update);
    return () => {
      media.removeEventListener('change', update);
      observer.disconnect();
      document.removeEventListener('motion:change', update);
    };
  }, []);
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
  const kind = opts.kind ?? 'feedback';
  const cfg = cfgOf(opts.preset ?? 'base');
  useIso(() => {
    if (!track.current) {
      track.current = new Track(target);
      frame.current(target);
      return;
    }
    const tr = track.current;
    if (!allowed(kind)) {
      cancel.current?.();
      tr.jump(target);
      frame.current(target);
      settle.current?.(target);
      return;
    }
    tr.set(target, config(kind, cfg), now());
    if (!cancel.current) {
      cancel.current = run({
        kind,
        step: (t) => {
          frame.current(tr.at(t));
          return tr.prune(t) > 0;
        },
        finish: () => {
          cancel.current = null;
          tr.jump(tr.target);
          frame.current(tr.target);
          settle.current?.(tr.target);
        },
      });
    }
  }, [target, kind, cfg.w]);
  useEffect(() => () => cancel.current?.(), []);
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
  if (!Object.is(s.shown, value)) setS({ shown: value, leaving: reduced ? null : s.shown, key: s.key + 1 });
  const done = useCallback((key: number) => setS((p) => (p.key === key && p.leaving !== null ? { ...p, leaving: null } : p)), []);
  useEffect(() => {
    if (s.leaving === null) return;
    const id = setTimeout(() => done(s.key), fallbackMs);
    return () => clearTimeout(id);
  }, [s.leaving, s.key, done, fallbackMs]);
  return { ...s, done };
}

const SWAP_CSS = `.mk-swap{display:inline-grid;vertical-align:baseline}.mk-swap>*{grid-area:1/1}
.mk-swap-out{pointer-events:none;animation:mk-out var(--motion-duration-exit,100ms) cubic-bezier(.4,0,1,1) both}
.mk-swap-in[data-swap]{animation:mk-in var(--motion-duration-base,300ms) var(--motion-ease-spring,cubic-bezier(.2,.15,.2,1)) var(--motion-duration-exit,100ms) both}
@keyframes mk-out{to{opacity:0;transform:translateY(calc(var(--motion-drift,4px)*-1))}}
@keyframes mk-in{from{opacity:0;transform:translateY(var(--motion-drift,4px))}}
@media (prefers-reduced-motion:reduce){.mk-swap-out,.mk-swap-in[data-swap]{animation-duration:0s;animation-delay:0s}}`;
let swapCss = false;
function ensureSwapCss() {
  if (swapCss || typeof document === 'undefined') return;
  swapCss = true;
  const el = document.createElement('style');
  el.setAttribute('data-motion-kit', 'swap');
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
    <span className={className ? `mk-swap ${className}` : 'mk-swap'}>
      {leaving !== null ? (
        <span key={`o${key}`} className="mk-swap-out" aria-hidden="true">
          {draw(leaving)}
        </span>
      ) : null}
      <span key={`i${key}`} className="mk-swap-in" data-swap={leaving !== null ? '' : undefined} onAnimationEnd={onEnd}>
        {draw(shown)}
      </span>
    </span>
  );
}

/** Rolling number: only changed digits roll, in the direction of change. The first render is instant. */
export function Digits({ value, className, kind }: { value: number | string; className?: string; kind?: MotionKind }) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useIso(() => {
    if (!ref.current) return;
    if (first.current) {
      first.current = false;
      ref.current.textContent = String(value);
      return;
    }
    return digits(ref.current, value, { kind });
  }, [value]);
  return <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }} />;
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
export function useEdges(indicator: RefObject<Element | null>, key: unknown): void {
  const last = useRef<{ left: number; right: number } | null>(null);
  useIso(() => {
    const el = indicator.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const prev = last.current;
    last.current = { left: r.left, right: r.right };
    if (prev) return edges(el, prev, undefined);
  }, [key]);
}

/** FLIP reflow: children of `container` slide from where they were to where they are after a render that changed `key`. */
export function useFlip(container: RefObject<Element | null>, key: unknown, opts?: { stagger?: number; clip?: Element }): void {
  const snapshot = useRef<Map<Element, DOMRect> | null>(null);
  if (typeof window !== 'undefined' && container.current && snapshot.current === null) {
    snapshot.current = new Map([...container.current.children].map((el) => [el, el.getBoundingClientRect()]));
  }
  useIso(() => {
    const el = container.current;
    const before = snapshot.current;
    snapshot.current = null;
    if (!el || !before) return;
    return flip(el, () => {}, { ...opts, before });
  }, [key]);
}

/** Mount/unmount with a shared enter/exit spring. Returns whether to render and a ref for the element. */
export function usePresence<T extends HTMLElement>(open: boolean, opts: PresenceOptions = {}): { mounted: boolean; ref: RefObject<T | null> } {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<T>(null);
  if (open && !mounted) setMounted(true);
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    if (open) return enter(el, opts);
    return exit(el, { ...opts, done: () => setMounted(false) });
  }, [open, mounted]);
  return { mounted, ref };
}

export { S, EXIT, LAG, ARRIVE, Track, allowed, now, resp, prog, setMotionState } from '../core/spring.js';
export type { Preset, SpringConfig, MotionKind } from '../core/spring.js';
