// src/primitives/AudioLevelMeter/AudioLevelMeter.tsx
'use client';
/* AudioLevelMeter. A few bars that rise and fall with how loud the microphone is. The host passes a level, or a stream and the meter listens itself. */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSpring } from '../../react/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

const clamp01 = (n: number): number => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/** Floor of the meter in decibels: anything quieter reads as silence. */
const FLOOR_DB = 60;

/** Loudness of a block of samples (-1..1) as 0..1 on a perceptual dB scale: -60 dB or quieter is 0, 0 dB is 1. Empty input is 0. */
export function rmsLevel(samples: ArrayLike<number>): number {
  const n = samples.length;
  if (!n) return 0;
  let sum = 0;
  for (let i = 0; i < n; i += 1) {
    const s = samples[i];
    if (Number.isFinite(s)) sum += s * s;
  }
  const rms = Math.sqrt(sum / n);
  if (rms <= 0) return 0;
  return clamp01((20 * Math.log10(rms) + FLOOR_DB) / FLOOR_DB);
}

/** Bar heights (0.1..1) for a level: the middle bars rise the most, the outer ones follow at half height, and every bar keeps a visible stub. */
export function levelBars(level: number, count: number): number[] {
  const n = Number.isFinite(count) ? Math.min(32, Math.max(0, Math.floor(count))) : 0;
  const l = clamp01(level);
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => {
    const dist = mid > 0 ? Math.abs(i - mid) / mid : 0;
    return Math.min(1, Math.max(0.1, 0.1 + 0.9 * l * (1 - 0.5 * dist)));
  });
}

export interface AudioLevelMeterProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; bar?: PrimitivePartProps };

  /** Controlled loudness, 0 to 1. When set it wins over the stream. */
  level?: number;
  /** Live microphone stream. The meter makes its own analyser in an effect and closes it on cleanup. */
  stream?: MediaStream;
  /** Number of bars. Defaults to 5. */
  bars?: number;
  /** Accessible name. Defaults to "Microphone level". */
  label?: string;
}

type AudioContextCtor = typeof AudioContext;

export function AudioLevelMeter({ className, slotProps, level, stream, bars = 5, label = 'Microphone level' }: AudioLevelMeterProps) {
  const count = Number.isFinite(bars) ? Math.min(32, Math.max(1, Math.floor(bars))) : 5;
  const [heard, setHeard] = useState(0);
  const controlled = level !== undefined;
  const target = clamp01(controlled ? level : heard);
  const root = useRef<HTMLSpanElement>(null);
  const shown = useRef(target);
  const seed = useMemo(() => levelBars(target, count), [count]); // eslint-disable-line react-hooks/exhaustive-deps

  const paint = (value: number) => {
    shown.current = value;
    const el = root.current;
    if (!el) return;
    el.style.setProperty('--cieo-level', value.toFixed(3));
    const heights = levelBars(value, count);
    for (let i = 0; i < el.children.length; i += 1) (el.children[i] as HTMLElement).style.setProperty('--cieo-bar', heights[i].toFixed(3));
  };
  useSpring(target, paint, { preset: 'base' });
  useEffect(() => paint(shown.current), [count]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!stream || controlled) return;
    const Ctor: AudioContextCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
    if (!Ctor) return;
    let ctx: AudioContext;
    try {
      ctx = new Ctor();
    } catch {
      return;
    }
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode;
    let tracks: MediaStreamTrack[] = [];
    const releaseAudioGraph = () => {
      try {
        source?.disconnect();
      } catch {
        /* already disconnected */
      }
      try {
        void ctx.close().catch(() => {});
      } catch {
        /* context already closed */
      }
    };
    try {
      tracks = stream.getAudioTracks();
      if (tracks.length === 0 || tracks.every((track) => track.readyState === 'ended')) throw new Error('stream has no live audio tracks');
      source = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
    } catch {
      releaseAudioGraph();
      return;
    }
    try {
      void ctx.resume?.().catch(() => {});
    } catch {
      releaseAudioGraph();
      return;
    }
    const buffer = new Float32Array(analyser.fftSize);
    let raf = 0;
    let lastAt = 0;
    let last = 0;
    let stopped = false;
    const stopSampling = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      tracks.forEach((track) => track.removeEventListener('ended', onTrackEnded));
      releaseAudioGraph();
      setHeard(0);
    };
    const onTrackEnded = () => {
      if (tracks.every((track) => track.readyState === 'ended')) stopSampling();
    };
    tracks.forEach((track) => track.addEventListener('ended', onTrackEnded));
    if (tracks.every((track) => track.readyState === 'ended')) {
      stopSampling();
      return;
    }
    const loop = (t: number) => {
      if (stopped) return;
      if (tracks.every((track) => track.readyState === 'ended')) {
        stopSampling();
        return;
      }
      raf = requestAnimationFrame(loop);
      if (t - lastAt < 50) return;
      lastAt = t;
      analyser.getFloatTimeDomainData(buffer);
      const next = Math.round(rmsLevel(buffer) * 50) / 50;
      if (next !== last) {
        last = next;
        setHeard(next);
      }
    };
    raf = requestAnimationFrame(loop);
    return stopSampling;
  }, [stream, controlled]);

  return (
    <span ref={root} role="img" aria-label={label} className="cieo cieo-audio-level-meter" style={{ '--cieo-level': target.toFixed(3) } as CSSProperties} {...customizePart(slotProps?.root, "cieo cieo-audio-level-meter", { '--cieo-level': target.toFixed(3) } as CSSProperties, className)}>
      {seed.map((h, i) => (
        <span key={i} aria-hidden="true" className="cieo-audio-level-meter-bar" style={{ '--cieo-bar': h.toFixed(3) } as CSSProperties} {...customizePart(slotProps?.bar, "cieo-audio-level-meter-bar", { '--cieo-bar': h.toFixed(3) } as CSSProperties)} />
      ))}
    </span>
  );
}
