// src/primitives/AnnotationPin/AnnotationPin.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AnnotationPin. Numbered teardrop marker whose tip sits on a point of a layer; the host owns the thread it opens. */

export type AnnotationPinState = 'draft' | 'open' | 'resolved';

/** Accessible name: "Comment 3, open" or "Comment 3 by Ava, resolved". Index is clamped to a whole number of at least 1. */
export function annotationPinLabel(index: number, state: AnnotationPinState = 'open', author?: string): string {
  const n = Number.isFinite(index) ? Math.max(1, Math.floor(index)) : 1;
  const by = author && author.trim() ? ` by ${author.trim()}` : '';
  return `Comment ${n}${by}, ${state}`;
}

/** Clamps a layer coordinate to 0..1; NaN becomes 0. */
export function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export interface AnnotationPinProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; body?: PrimitivePartProps; text?: PrimitivePartProps };

  /** 1-based number drawn on the pin and spoken in its name. */
  index: number;
  /** Horizontal position as a 0..1 fraction of the layer. The tip lands here. */
  x: number;
  /** Vertical position as a 0..1 fraction of the layer. The tip lands here. */
  y: number;
  /** draft is the unsent pin, open has a live thread, resolved is muted and smaller. Defaults to open. */
  state?: AnnotationPinState;
  /** True while its thread is open: draws a focus-like ring. */
  selected?: boolean;
  /** Author name, added to the accessible name ("Comment 3 by Ava, resolved"). */
  label?: string;
  /** 1-3 characters drawn in place of the number, for pins that show who commented. */
  initials?: string;
  /** Called when the pin is pressed with a pointer, Enter or Space. */
  onSelect?: () => void;
}

export function AnnotationPin({ className, slotProps, index, x, y, state = 'open', selected = false, label, initials, onSelect }: AnnotationPinProps) {
  const n = Number.isFinite(index) ? Math.max(1, Math.floor(index)) : 1;
  return (
    <button
      type="button"
      aria-label={annotationPinLabel(n, state, label)}
      aria-pressed={selected}
      data-state={state}
      data-selected={selected ? 'true' : undefined}
      onClick={onSelect}
      style={{ left: `${clampUnit(x) * 100}%`, top: `${clampUnit(y) * 100}%` }}
      className="cieo cieo-annotation-pin" {...customizePart(slotProps?.root, "cieo cieo-annotation-pin", { left: `${clampUnit(x) * 100}%`, top: `${clampUnit(y) * 100}%` }, className)}
    >
      <span aria-hidden="true" className="cieo-annotation-pin-body" {...customizePart(slotProps?.body, "cieo-annotation-pin-body", undefined)}>
        <span className="cieo-annotation-pin-text" {...customizePart(slotProps?.text, "cieo-annotation-pin-text", undefined)}>{initials && initials.trim() ? initials.trim().slice(0, 3) : n}</span>
      </span>
    </button>
  );
}
