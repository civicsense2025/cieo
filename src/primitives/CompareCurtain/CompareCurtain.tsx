'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* CompareCurtain. Before/after compare with a slider-role divider. The divider follows the pointer one to one;
   keyboard and programmatic moves settle on the soft spring. Reduced motion jumps. */
import { useEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useSpring } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface CompareCurtainProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; before?: PrimitivePartProps; after?: PrimitivePartProps; divider?: PrimitivePartProps };

  /** Accessible name for the divider slider (e.g. "Comparison divider"). Required. */
  label: string;
  /** Words spoken after the percentage (e.g. "vector result visible"). Required. */
  valueText: string;
  /** Full-bleed layer underneath. Required. */
  before: ReactNode;
  /** Layer clipped from the inline end by position. Required. */
  after: ReactNode;
  /** Divider position, 0–100. Clamped. */
  position: number;
  /** Called with the clamped 0–100 position. Host owns the value. */
  onMove?: (position: number) => void;
  /** Keyboard step in points. Defaults to 4. */
  step?: number;
}

const clamp = (p: number) => Math.min(100, Math.max(0, Number.isFinite(p) ? p : 0));

export function CompareCurtain({ className, slotProps, label, valueText, before, after, position, onMove, step = 4, motion, entering, exiting }: CompareCurtainProps) {
  const clamped = clamp(position);
  const clipRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const live = useRef(true);

  function paint(p: number) {
    const c = clamp(p);
    if (clipRef.current) clipRef.current.style.clipPath = `inset(0 ${(100 - c).toFixed(2)}% 0 0)`;
    if (dividerRef.current) {
      dividerRef.current.style.insetInlineStart = `${c.toFixed(2)}%`;
      dividerRef.current.setAttribute('aria-valuenow', String(Math.round(c)));
      dividerRef.current.setAttribute('aria-valuetext', `${Math.round(c)} percent ${valueText}`);
    }
  }

  useSpring(clamped, (v) => {
    if (live.current && !dragging.current) paint(v);
  }, { preset: 'soft' });
  useEffect(() => {
    live.current = motion !== false;
    if (motion === false) paint(clamped);
  });

  function move(clientX: number) {
    const bounds = dividerRef.current?.parentElement?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;
    const next = clamp(((clientX - bounds.left) / bounds.width) * 100);
    paint(next);
    onMove?.(next);
  }
  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (dragging.current && e.currentTarget.hasPointerCapture(e.pointerId)) move(e.clientX);
  }
  function endDrag(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    paint(clamped);
  }
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
    if (delta !== 0) {
      e.preventDefault();
      onMove?.(clamp(clamped + delta));
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      onMove?.(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onMove?.(100);
    }
  }

  return (
    <div className="cieo cieo-compare" {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-compare", undefined, className)}>
      <div className="cieo-compare-before" {...customizePart(slotProps?.before, "cieo-compare-before", undefined)}>{before}</div>
      <div
        ref={clipRef}
        className="cieo-compare-after"
        style={{ clipPath: `inset(0 ${(100 - clamped).toFixed(2)}% 0 0)` }}
        {...customizePart(slotProps?.after, "cieo-compare-after", undefined)}
      >
        {after}
      </div>
      <button
        ref={dividerRef}
        type="button"
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={`${Math.round(clamped)} percent ${valueText}`}
        aria-orientation="horizontal"
        className="cieo-compare-divider"
        style={{ insetInlineStart: `${clamped.toFixed(2)}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        {...customizePart(slotProps?.divider, "cieo-compare-divider", undefined)}
      />
    </div>
  );
}
