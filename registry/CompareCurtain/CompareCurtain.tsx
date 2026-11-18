'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* CompareCurtain. Before/after compare with a slider-role divider. The divider follows the pointer one to one
   from the inline-start edge in both directions; keyboard (arrows, PageUp/PageDown, Home/End with APG RTL
   arrows) and programmatic moves settle on the soft spring. Reduced motion jumps. */
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
  /** Large keyboard step in points for PageUp/PageDown. Defaults to ten times step. */
  largeStep?: number;
}

const clamp = (p: number) => Math.min(100, Math.max(0, Number.isFinite(p) ? p : 0));

/** Pointer fraction from the inline-start edge, so dragging toward inline-start reduces the value in both directions. */
export function curtainFraction(clientX: number, left: number, right: number, rtl: boolean): number {
  const width = right - left;
  if (width <= 0) return 0;
  return rtl ? (right - clientX) / width : (clientX - left) / width;
}

/** Keyboard move in points for a key; 'min'/'max' for Home/End, null when unhandled. Arrows follow APG direction: in RTL, ArrowRight decreases. */
export function curtainKeyMove(key: string, step: number, largeStep: number, rtl: boolean): number | 'min' | 'max' | null {
  const fwd = (d: number) => (rtl ? -d : d);
  if (key === 'ArrowRight' || key === 'ArrowUp') return fwd(step);
  if (key === 'ArrowLeft' || key === 'ArrowDown') return fwd(-step);
  if (key === 'PageUp') return largeStep;
  if (key === 'PageDown') return -largeStep;
  if (key === 'Home') return 'min';
  if (key === 'End') return 'max';
  return null;
}

export function CompareCurtain({ className, slotProps, label, valueText, before, after, position, onMove, step = 4, largeStep, motion, entering, exiting }: CompareCurtainProps) {
  const clamped = clamp(position);
  const large = largeStep ?? step * 10;
  const clipRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const live = useRef(true);
  const rtlRef = useRef(false);

  function syncDir(el: Element | null) {
    if (el && typeof getComputedStyle === 'function') rtlRef.current = getComputedStyle(el).direction === 'rtl';
  }
  function paint(p: number) {
    const c = clamp(p);
    if (clipRef.current) clipRef.current.style.clipPath = rtlRef.current ? `inset(0 0 0 ${(100 - c).toFixed(2)}%)` : `inset(0 ${(100 - c).toFixed(2)}% 0 0)`;
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
    syncDir(dividerRef.current);
    if (motion === false) paint(clamped);
  });

  function move(clientX: number) {
    const root = dividerRef.current?.parentElement;
    const bounds = root?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;
    syncDir(root ?? null);
    const next = clamp(curtainFraction(clientX, bounds.left, bounds.right, rtlRef.current) * 100);
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
    syncDir(e.currentTarget);
    const moveBy = curtainKeyMove(e.key, step, large, rtlRef.current);
    if (moveBy === null) return;
    e.preventDefault();
    onMove?.(moveBy === 'min' ? 0 : moveBy === 'max' ? 100 : clamp(clamped + moveBy));
  }

  const afterStyle = { clipPath: `inset(0 ${(100 - clamped).toFixed(2)}% 0 0)` };
  const dividerStyle = { insetInlineStart: `${clamped.toFixed(2)}%` };
  return (
    <div className="cieo cieo-compare" {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-compare", undefined, className)}>
      <div className="cieo-compare-before" {...customizePart(slotProps?.before, "cieo-compare-before", undefined)}>{before}</div>
      <div
        ref={clipRef}
        className="cieo-compare-after"
        style={afterStyle}
        {...customizePart(slotProps?.after, "cieo-compare-after", afterStyle)}
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
        style={dividerStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        {...customizePart(slotProps?.divider, "cieo-compare-divider", dividerStyle)}
      />
    </div>
  );
}
