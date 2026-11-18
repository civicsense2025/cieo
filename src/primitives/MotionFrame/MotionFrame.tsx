'use client';
/* MotionFrame: ResizeObserver height spring + directional contentKey swap on critically damped springs. */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { ARRIVE, S, Track, allowed, config, now, run, type Preset, type SpringConfig } from '../../core/spring.js';
import { enter, type Cancel } from '../../dom/index.js';
import { useSharedAxis } from '../../react/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p: Preset | SpringConfig): SpringConfig => (typeof p === 'string' ? S[p] : p);

export interface MotionFrameProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; content?: PrimitivePartProps };
  /** Key identifying the active content view; changes trigger height spring + directional arrival. */
  contentKey?: string | number;
  /** Shared-axis travel sign: 1 forward, -1 backward, 0 pure cross-arrival. Defaults to 0. */
  direction?: -1 | 0 | 1;
  /** Axis for directional swaps. Defaults to x. */
  axis?: 'x' | 'y';
  /** Distance in pixels for shared-axis slide. Defaults to 16. */
  distance?: number;
  /** Spring preset or config for height and arrival. Defaults to soft. */
  preset?: Preset | SpringConfig;
  /** False disables motion and snaps immediately. Defaults to true. */
  motion?: boolean;
  /** Alias to disable motion. Defaults to false. */
  disabled?: boolean;
  children: ReactNode;
}

export function MotionFrame({
  className,
  slotProps,
  contentKey = 'default',
  direction = 0,
  axis = 'x',
  distance = 16,
  preset = 'soft',
  motion = true,
  disabled = false,
  children,
}: MotionFrameProps) {
  const isDisabled = disabled || motion === false;
  const frameRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<Track | null>(null);
  const cancelRef = useRef<Cancel | null>(null);
  const readyRef = useRef(false);
  const prevKeyRef = useRef<{ set: boolean; key: string | number }>({ set: false, key: contentKey });
  /* An inline preset object changes identity every render; the observer must not restart for that. */
  const presetRef = useRef(preset);
  presetRef.current = preset;

  const { ref: axisRef } = useSharedAxis<HTMLDivElement>(contentKey, direction, {
    axis,
    distance,
    preset,
    disabled: isDisabled,
  });

  /* Neutral arrival when direction === 0 and contentKey changes. */
  useIso(() => {
    if (!prevKeyRef.current.set) {
      prevKeyRef.current = { set: true, key: contentKey };
      return;
    }
    if (Object.is(prevKeyRef.current.key, contentKey)) return;
    prevKeyRef.current.key = contentKey;
    const el = axisRef.current;
    if (!el || isDisabled || direction !== 0) return;
    return enter(el, {
      cfg: cfgOf(preset),
      from: { x: 0, y: 0, opacity: ARRIVE, scale: 1, blur: 0 },
    });
  }, [contentKey, direction, isDisabled]);

  /* ResizeObserver height spring writing directly to frameRef without React re-renders. */
  useIso(() => {
    const frame = frameRef.current;
    const inner = measureRef.current;
    if (!frame || !inner) return;

    const syncHeight = (target: number, jump: boolean) => {
      if (!Number.isFinite(target) || target < 0) return;
      if (!trackRef.current) trackRef.current = new Track(target, cfgOf(preset));
      const tr = trackRef.current;
      if (jump || isDisabled || !allowed('feedback', frame)) {
        cancelRef.current?.();
        cancelRef.current = null;
        tr.jump(target);
        frame.style.height = '';
        frame.style.overflow = '';
        return;
      }
      if (Math.abs(tr.target - target) < 0.5 && cancelRef.current) return;
      const current = tr.at(now());
      if (Math.abs(current - target) < 0.5) {
        tr.jump(target);
        frame.style.height = '';
        frame.style.overflow = '';
        return;
      }
      frame.style.height = `${current.toFixed(2)}px`;
      frame.style.overflow = 'clip';
      tr.set(target, config('feedback', cfgOf(presetRef.current)));
      if (!cancelRef.current) {
        cancelRef.current = run({
          kind: 'feedback',
          step: (t) => {
            frame.style.height = `${Math.max(0, tr.at(t)).toFixed(2)}px`;
            return tr.prune(t) > 0;
          },
          finish: () => {
            cancelRef.current = null;
            tr.jump(tr.target);
            frame.style.height = '';
            frame.style.overflow = '';
          },
        });
      }
    };

    syncHeight(inner.offsetHeight, !readyRef.current);
    readyRef.current = true;

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      syncHeight(inner.offsetHeight, false);
    });
    observer.observe(inner);
    return () => {
      observer.disconnect();
      cancelRef.current?.();
      cancelRef.current = null;
    };
  }, [isDisabled]);

  return (
    <div
      ref={frameRef}
      data-direction={direction}
      data-content-key={String(contentKey)}
      data-motion={isDisabled ? 'off' : 'on'}
      className="cieo cieo-motion-frame"
      {...customizePart(slotProps?.root, 'cieo cieo-motion-frame', undefined, className)}
    >
      <div ref={measureRef} className="cieo-motion-frame-content" {...customizePart(slotProps?.content, 'cieo-motion-frame-content')}>
        <div ref={axisRef} key={String(contentKey)}>
          {children}
        </div>
      </div>
    </div>
  );
}
