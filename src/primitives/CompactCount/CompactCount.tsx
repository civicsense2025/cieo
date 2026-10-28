// src/primitives/CompactCount/CompactCount.tsx
'use client';
/* CompactCount. A count shortened for scanning (26.3K) whose digits roll in the direction of change. The exact number stays in the accessible text. */
import { Digits } from '../../react/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

/** Short, locale-aware form of a count: 164, 1.2K, 26.3K, 4M. Negative, fractional and non-finite input is clamped to a whole count of at least 0. */
export function formatCompactCount(n: number, locale = 'en'): string {
  const whole = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(whole);
}

/** Exact form for screen readers and titles: 26,300. */
export function formatExactCount(n: number, locale = 'en'): string {
  const whole = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return new Intl.NumberFormat(locale).format(whole);
}

export interface CompactCountProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** The count to show. */
  value: number;
  /** Locale for formatting. Defaults to en. */
  locale?: string;
  /** Word read after the exact number (e.g. "likes", "views"). Optional. */
  unit?: string;
  /** False shows a zero instead of hiding it. Defaults to true (zero renders nothing visible, as feeds do). */
  hideZero?: boolean;
  /** False swaps the number without rolling. Defaults to true; reduced motion never rolls. */
  motion?: boolean;
}

export function CompactCount({ className, slotProps, value, locale = 'en', unit, hideZero = true, motion = true }: CompactCountProps) {
  const short = formatCompactCount(value, locale);
  const exact = `${formatExactCount(value, locale)}${unit ? ` ${unit}` : ''}`;
  const empty = hideZero && short === formatCompactCount(0, locale);
  return (
    <span className="cieo cieo-compact-count" data-empty={empty ? '' : undefined} title={exact} {...customizePart(slotProps?.root, "cieo cieo-compact-count", undefined, className)}>
      <span aria-hidden="true">{empty ? null : motion ? <Digits value={short} /> : short}</span>
      <span className="cieo-sr-only">{exact}</span>
    </span>
  );
}
