// src/primitives/AudioWaveform/AudioWaveform.tsx
'use client';
/* AudioWaveform. Bars drawn from a clip's peaks; the played part fills continuously and, when the host passes onSeek, the whole thing is a scrubber. The host owns time. */
import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { speakAudioTime } from '../AudioTime/AudioTime.js';

/** Shortest a bar can be, as a fraction of full height, so silence still shows a tick. */
export const WAVEFORM_FLOOR = 0.08;
/** Seconds one arrow key moves the playhead. */
export const WAVEFORM_KEY_SECONDS = 5;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/** Reduces peaks to `count` bars: each bar is the loudest peak in its bucket, scaled so the loudest bar is 1, never below the floor. Empty or silent input gives all floor values. */
export function waveformBars(peaks: number[], count: number): number[] {
  const n = Math.max(0, Math.floor(finite(count)));
  if (n === 0) return [];
  const total = peaks.length;
  if (total === 0) return Array.from({ length: n }, () => WAVEFORM_FLOOR);
  const raw = Array.from({ length: n }, (_, i) => {
    const start = Math.min(total - 1, Math.floor((i * total) / n));
    const end = Math.max(start + 1, Math.floor(((i + 1) * total) / n));
    let max = 0;
    for (let j = start; j < Math.min(total, end); j++) max = Math.max(max, Math.abs(finite(peaks[j])));
    return max;
  });
  const top = Math.max(...raw);
  if (top <= 0) return raw.map(() => WAVEFORM_FLOOR);
  return raw.map((v) => Math.max(WAVEFORM_FLOOR, v / top));
}

/** Seconds under a pointer at x within a track of the given width. Clamped to 0..duration; a zero-width track or unknown duration gives 0. */
export function seekFromPointer(x: number, width: number, duration: number): number {
  if (!(width > 0) || !Number.isFinite(duration) || duration <= 0) return 0;
  return clamp(x / width, 0, 1) * duration;
}

/** New playhead for a key on the scrubber, clamped to 0..duration; null for keys that do nothing. Arrows move 5 s, Page keys 10 percent, Home and End jump to the ends. */
export function waveformKeyStep(key: string, current: number, duration: number): number | null {
  const d = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const c = finite(current);
  const to = (t: number) => clamp(t, 0, d);
  if (key === 'ArrowLeft' || key === 'ArrowDown') return to(c - WAVEFORM_KEY_SECONDS);
  if (key === 'ArrowRight' || key === 'ArrowUp') return to(c + WAVEFORM_KEY_SECONDS);
  if (key === 'PageDown') return to(c - d * 0.1);
  if (key === 'PageUp') return to(c + d * 0.1);
  if (key === 'Home') return 0;
  if (key === 'End') return d;
  return null;
}

/** Spoken position for a scrubber: "12 seconds of 1 minute 3 seconds". */
export function audioSeekText(current: number, duration: number): string {
  return `${speakAudioTime(current)} of ${speakAudioTime(duration)}`;
}

/** Pointer-scrub and keyboard handlers shared by the waveform and the player's plain track. No state: the host re-renders from onSeek. */
export function useScrub(duration: number, current: number, onSeek: ((seconds: number) => void) | undefined) {
  const dragging = useRef(false);
  const seekAt = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onSeek?.(seekFromPointer(e.clientX - r.left, r.width, duration));
  };
  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (!onSeek || e.button > 0) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      seekAt(e);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      if (dragging.current) seekAt(e);
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      dragging.current = false;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    },
    onPointerCancel() {
      dragging.current = false;
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      if (!onSeek || e.altKey || e.ctrlKey || e.metaKey) return;
      const next = waveformKeyStep(e.key, current, duration);
      if (next === null) return;
      e.preventDefault();
      onSeek(next);
    },
  };
}

export interface AudioWaveformProps {
  /** Loudness samples for the clip, any length, any scale (0..1 typical). Empty draws a row of ticks. */
  peaks: number[];
  /** Clip length in seconds. */
  duration: number;
  /** Playhead in seconds. */
  current: number;
  /** Called with the new playhead when the reader scrubs or uses the keys. Omit for a read-only picture. */
  onSeek?: (seconds: number) => void;
  /** What the waveform is (e.g. "Voice note from Ana"). Required. */
  label: string;
  /** How many bars to draw. Defaults to 48. */
  bars?: number;
}

/** Total entrance stagger across all bars, in ms. */
const STAGGER_MS = 240;

export function AudioWaveform({ peaks, duration, current, onSeek, label, bars = 48 }: AudioWaveformProps) {
  const count = Math.max(1, Math.floor(bars));
  const heights = waveformBars(peaks, count);
  const d = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const c = clamp(finite(current), 0, d);
  const progress = d > 0 ? c / d : 0;
  const scrub = useScrub(d, c, onSeek);
  const style = { '--progress': progress, '--step': `${(STAGGER_MS / count).toFixed(2)}ms` } as CSSProperties;
  const draw = (hidden: boolean) => (
    <span className={hidden ? 'cieo-audio-waveform-bars cieo-audio-waveform-played' : 'cieo-audio-waveform-bars'} aria-hidden="true">
      {heights.map((h, i) => (
        <span key={i} className="cieo-audio-waveform-bar" style={{ '--h': h, '--i': i } as CSSProperties} />
      ))}
    </span>
  );
  const common = { className: 'cieo cieo-audio-waveform', style, 'data-seekable': onSeek ? '' : undefined, 'aria-label': label } as const;
  if (!onSeek) {
    return (
      <div {...common} role="img">
        {draw(false)}
        {draw(true)}
      </div>
    );
  }
  return (
    <div {...common} role="slider" tabIndex={0} aria-valuemin={0} aria-valuemax={d} aria-valuenow={Math.floor(c)} aria-valuetext={audioSeekText(c, d)} aria-orientation="horizontal" {...scrub}>
      {draw(false)}
      {draw(true)}
    </div>
  );
}
