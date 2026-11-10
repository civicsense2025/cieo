// src/primitives/ShareBar/ShareBar.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ShareBar. Twin of CieoUI ShareBar: a missing figure never shows as a fake split. */
export interface ShareBarSegment { value: number; color: string; label?: string }
export interface ShareBarProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  segments: ShareBarSegment[];
  /** What the bar shows, read by screen readers, such as "Yes 73, No 25". */
  label: string;
}
/** Fractions of the whole, or null when any share is missing, zero, negative or alone. */
export function shareFractions(values: number[]): number[] | null {
  if (values.length < 2 || values.some((v) => !Number.isFinite(v) || v <= 0)) return null;
  const total = values.reduce((a, b) => a + b, 0);
  return values.map((v) => v / total);
}
export function ShareBar({ className, slotProps, segments, label }: ShareBarProps) {
  const fractions = shareFractions(segments.map((s) => s.value));
  if (!fractions) return null;
  return (
    <div {...customizePart(slotProps?.root, "cieo cieo-p-share-bar", undefined, className)} role="img" aria-label={label}>
      {segments.map((s, i) => <span key={i} style={{ flexGrow: fractions[i], background: s.color }} />)}
    </div>
  );
}
