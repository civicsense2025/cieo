'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Spinner. Loading indicator with an accessible label. CSS rotation only; rests under reduced motion. */
export interface SpinnerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; ring?: PrimitivePartProps };
 label?: string; size?: 'sm' | 'md'; /** False stops rotation via data-motion="off". Defaults to true. */ motion?: boolean; }
export function Spinner({ className, slotProps, label = 'Loading', size = 'md', motion }: SpinnerProps) {
  return (<span role="status" aria-label={label} data-size={size} data-motion={motion === false ? 'off' : undefined} className="cieo cieo-p-spinner" {...customizePart(slotProps?.root, "cieo cieo-p-spinner", undefined, className)}><span aria-hidden="true" className="cieo-p-spinner-ring" {...customizePart(slotProps?.ring, "cieo-p-spinner-ring", undefined)} /></span>);
}
