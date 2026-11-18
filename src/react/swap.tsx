'use client';
/* React SwapText, useSwap, and Digits components. Keyframes live in design/styles/primitives/motion.css
   (and cieo/controls.css), so strict CSP pages never need runtime <style> injection. */
import { useCallback, useEffect, useRef, useState, type AnimationEvent, type ReactNode } from 'react';
import type { MotionKind } from '../core/spring.js';
import { digits } from '../dom/index.js';
import { useIso, useReducedMotion } from './hooks.js';

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

/** Text swap: the old value drifts up and fades out, then the new one fades in, in one grid cell so nothing reflows mid-swap. */
export function SwapText({ value, className, render }: { value: string | number; className?: string; render?: (v: string | number) => ReactNode }) {
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
