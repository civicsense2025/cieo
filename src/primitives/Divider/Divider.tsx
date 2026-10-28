'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Divider. Thematic break between sections. Decorative unless given a label. */
export interface DividerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 label?: string; }
export function Divider({ className, slotProps, label }: DividerProps) {
  return (<hr aria-label={label} className="cieo cieo-p-divider" {...customizePart(slotProps?.root, "cieo cieo-p-divider", undefined, className)} />);
}
