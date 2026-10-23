// src/primitives/CharacterCountRing/CharacterCountRing.tsx
'use client';
/* CharacterCountRing. Ring that fills as a text limit is used. Host owns the text and the limit; this owns the math, the countdown and the tone. */
import { useRef } from 'react';
import { useSpring } from '../../react/index.js';

export interface CharacterCountRingProps {
  /** Characters used so far. Required. */
  length: number;
  /** The limit. Required. */
  max: number;
  /** Remaining characters at which the ring warns and shows the countdown. Defaults to 20. */
  warnAt?: number;
}

export interface RingState {
  /** 0 to 1, how full the ring is. */
  fraction: number;
  /** Characters left; negative once past the limit. */
  remaining: number;
  tone: 'normal' | 'warning' | 'danger';
  /** True when the countdown number should be visible inside the ring. */
  showNumber: boolean;
}

const whole = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);

/** Pure ring state. Bad input (NaN, negatives) clamps to an empty ring; a limit of 0 or less is always full and over. */
export function ringState(length: number, max: number, warnAt = 20): RingState {
  const used = whole(length);
  const limit = whole(max);
  const remaining = limit - used;
  const fraction = limit === 0 ? 1 : Math.min(1, used / limit);
  const warn = Number.isFinite(warnAt) ? Math.max(0, warnAt) : 20;
  const tone = remaining < 0 ? 'danger' : remaining <= warn ? 'warning' : 'normal';
  return { fraction, remaining, tone, showNumber: remaining <= warn };
}

/** Screen-reader sentence for the current count. */
export function ringAnnouncement(remaining: number): string {
  if (remaining < 0) {
    const over = -remaining;
    return `${over} ${over === 1 ? 'character' : 'characters'} over the limit`;
  }
  return `${remaining} ${remaining === 1 ? 'character' : 'characters'} left`;
}

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DISPLAY_FLOOR = -99;

export function CharacterCountRing({ length, max, warnAt = 20 }: CharacterCountRingProps) {
  const s = ringState(length, max, warnAt);
  const arc = useRef<SVGCircleElement>(null);
  /* The first value is frozen so React never rewrites the offset the spring is driving. */
  const first = useRef(CIRCUMFERENCE * (1 - s.fraction));
  useSpring(
    s.fraction,
    (v) => {
      if (arc.current) arc.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - v));
    },
    { preset: 'soft' },
  );
  return (
    <span className="cieo cieo-character-count-ring" data-tone={s.tone} data-grown={s.showNumber ? '' : undefined}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="cieo-character-count-ring-track" cx="12" cy="12" r={RADIUS} fill="none" strokeWidth="2" />
        <circle
          ref={arc}
          className="cieo-character-count-ring-arc"
          cx="12"
          cy="12"
          r={RADIUS}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: first.current }}
          transform="rotate(-90 12 12)"
        />
      </svg>
      {s.showNumber ? (
        <span className="cieo-character-count-ring-number" aria-hidden="true">
          {Math.max(DISPLAY_FLOOR, s.remaining)}
        </span>
      ) : null}
      <span className="cieo-sr-only">{ringAnnouncement(s.remaining)}</span>
    </span>
  );
}
