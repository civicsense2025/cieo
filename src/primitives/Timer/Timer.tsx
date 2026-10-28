// src/primitives/Timer/Timer.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Timer. Elapsed or remaining seconds rendered as mm:ss. */
export interface TimerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Total seconds. Required. */
  seconds: number;
}

export function Timer({ className, slotProps, seconds }: TimerProps) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <time dateTime={`PT${seconds}S`} className="cieo cieo-p-timer" {...customizePart(slotProps?.root, "cieo cieo-p-timer", undefined, className)}>
      {mm}:{ss}
    </time>
  );
}
