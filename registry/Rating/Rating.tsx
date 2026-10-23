// src/primitives/Rating/Rating.tsx
'use client';
/* Rating. Star rating: a radio group the viewer can set, or a read-only summary. The host owns the value. */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../react/index.js';

/** Value a key moves to (1..max), or null when the key does nothing or the value would not change. No wrapping. */
export function ratingKeyStep(key: string, value: number, max: number): number | null {
  const top = Math.max(1, Math.floor(max) || 1);
  const now = Number.isFinite(value) ? Math.min(top, Math.max(0, Math.round(value))) : 0;
  let next: number | null = null;
  if (key === 'ArrowRight' || key === 'ArrowUp') next = Math.min(top, now + 1);
  else if (key === 'ArrowLeft' || key === 'ArrowDown') next = Math.max(1, now - 1);
  else if (key === 'Home') next = 1;
  else if (key === 'End') next = top;
  return next === null || next === now ? null : next;
}

/** Spoken summary: "4 out of 5". Value clamps to 0..max; halves keep one decimal. */
export function ratingLabel(value: number, max: number): string {
  const top = Math.max(1, Math.floor(max) || 1);
  const v = Number.isFinite(value) ? Math.min(top, Math.max(0, value)) : 0;
  return `${Number.isInteger(v) ? v : v.toFixed(1)} out of ${top}`;
}

/** Start delays (ms) for stars from..to-1 popping in turn; the last starts by `window`, so the whole stagger fits in it. */
export function ratingPopDelays(from: number, to: number, window = 150): number[] {
  const n = Math.max(0, Math.floor(to) - Math.max(0, Math.floor(from)));
  if (n === 0) return [];
  const step = n === 1 ? 0 : Math.min(40, window / (n - 1));
  return Array.from({ length: n }, (_, i) => Math.round(i * step));
}

export interface RatingProps {
  /** Current rating, 0 for none. Fractions only display in read-only mode. */
  value: number;
  /** Called with the new rating when the viewer picks a star or uses the keyboard. */
  onChange?: (value: number) => void;
  /** Number of stars. Defaults to 5. */
  max?: number;
  /** What is being rated ("Rate this reply"). Required. */
  label: string;
  /** Shows the rating as an image ("4 out of 5") with no interaction. */
  readOnly?: boolean;
  /** Star size. Defaults to md. */
  size?: 'sm' | 'md';
}

const STAR = 'M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z';

export function Rating({ value, onChange, max = 5, label, readOnly, size = 'md' }: RatingProps) {
  const top = Math.max(1, Math.floor(max) || 1);
  const safe = Number.isFinite(value) ? Math.min(top, Math.max(0, value)) : 0;
  const rounded = Math.round(safe);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const group = useRef<HTMLDivElement>(null);
  const previous = useRef(rounded);
  useEffect(() => {
    const from = previous.current;
    previous.current = rounded;
    if (readOnly || reduced || rounded <= from) return;
    const stars = group.current?.querySelectorAll<HTMLElement>('[data-star]');
    const delays = ratingPopDelays(from, rounded);
    const runs = delays.map((delay, i) => {
      const el = stars?.[from + i];
      if (!el || typeof el.animate !== 'function') return null;
      return el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 280, delay, easing: 'cubic-bezier(.2,.15,.2,1)' });
    });
    return () => runs.forEach((r) => r?.cancel());
  }, [rounded, readOnly, reduced]);

  const shown = hover ?? safe;
  const stars = Array.from({ length: top }, (_, i) => {
    const filled = shown >= i + 1 - 0.0001;
    return (
      <svg key={i} viewBox="0 0 24 24" aria-hidden="true" data-star="" data-filled={filled ? '' : undefined} className="cieo-rating-star" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={STAR} /></svg>
    );
  });

  if (readOnly) {
    return (
      <span ref={group} role="img" aria-label={ratingLabel(safe, top)} {...({ 'aria-description': label } as object)} data-size={size} data-readonly="" className="cieo cieo-rating">
        {stars}
      </span>
    );
  }

  const focusStar = (n: number) => group.current?.querySelectorAll<HTMLElement>('[role="radio"]')[n - 1]?.focus();
  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      data-size={size}
      className="cieo cieo-rating"
      onMouseLeave={() => setHover(null)}
      onKeyDown={(e) => {
        const next = ratingKeyStep(e.key, rounded, top);
        if (next === null) return;
        e.preventDefault();
        onChange?.(next);
        focusStar(next);
      }}
    >
      {Array.from({ length: top }, (_, i) => {
        const n = i + 1;
        return (
          <span
            key={n}
            role="radio"
            aria-checked={rounded === n}
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
            tabIndex={rounded === n || (rounded === 0 && n === 1) ? 0 : -1}
            className="cieo-rating-radio"
            onClick={() => onChange?.(n)}
            onMouseEnter={() => setHover(n)}
          >
            {stars[i]}
          </span>
        );
      })}
    </div>
  );
}
