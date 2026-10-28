'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ProgressBar. Task progress with native semantics. Renders <progress> styled by the design system; this file owns the contract, not the paint. */
export interface ProgressBarProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 value: number; max?: number; label: string; }
export function ProgressBar({ className, slotProps, value, max = 100, label }: ProgressBarProps) {
  return (<progress value={value} max={max} aria-label={label} className="cieo cieo-progress" {...customizePart(slotProps?.root, "cieo cieo-progress", undefined, className)} />);
}
