// src/primitives/NotifyToggle/NotifyToggle.tsx
'use client';
/* NotifyToggle. Bell toggle for "tell me about new replies": rings once and pops a check badge when turned on. The host owns the state. */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../react/index.js';

/** Total length of the ring, in milliseconds. */
export const BELL_WIGGLE_MS = 420;
/** Largest swing of the ring, in degrees. */
export const BELL_WIGGLE_DEGREES = 12;

/** Bell angle in degrees at progress t (0 to 1): a damped swing that starts and ends at rest. Out-of-range t clamps. */
export function bellWiggleAngle(t: number): number {
  const p = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0;
  return Math.round(BELL_WIGGLE_DEGREES * Math.exp(-4.5 * p) * Math.sin(p * Math.PI * 5) * 100) / 100;
}

/** Keyframe angles sampled from the damped swing, first and last at rest. */
export function bellWiggleFrames(steps = 10): number[] {
  const n = Math.max(2, Math.floor(steps));
  return Array.from({ length: n + 1 }, (_, i) => (i === 0 || i === n ? 0 : bellWiggleAngle(i / n)));
}

export interface NotifyToggleProps {
  /** Whether notifications are on. */
  on: boolean;
  /** Called on every press; the host flips `on`. */
  onToggle: () => void;
  /** Accessible name, a request in plain words. Defaults to "Notify me about new replies". */
  label?: string;
  /** Control height. Defaults to md. */
  size?: 'sm' | 'md';
}

export function NotifyToggle({ on, onToggle, label = 'Notify me about new replies', size = 'md' }: NotifyToggleProps) {
  const reduced = useReducedMotion();
  const bell = useRef<SVGSVGElement>(null);
  const before = useRef(on);
  useEffect(() => {
    const turnedOn = on && !before.current;
    before.current = on;
    const el = bell.current;
    if (!turnedOn || reduced || !el || typeof el.animate !== 'function') return;
    const frames = bellWiggleFrames();
    const run = el.animate(frames.map((deg, i) => ({ transform: `rotate(${deg}deg)`, offset: i / (frames.length - 1) })), { duration: BELL_WIGGLE_MS, easing: 'ease-out' });
    return () => run.cancel();
  }, [on, reduced]);
  return (
    <button type="button" className="cieo cieo-notify-toggle" aria-pressed={on} aria-label={label} data-on={on ? '' : undefined} data-size={size} onClick={onToggle}>
      <span className="cieo-notify-toggle-icon" aria-hidden="true">
        <svg ref={bell} className="cieo-notify-toggle-bell" viewBox="0 0 24 24" width="1.25em" height="1.25em" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transformOrigin: '50% 8%' }}>
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        <span className="cieo-notify-toggle-badge">
          <svg viewBox="0 0 12 12" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2.5 6.2 2.4 2.3 4.6-4.8" /></svg>
        </span>
      </span>
    </button>
  );
}
