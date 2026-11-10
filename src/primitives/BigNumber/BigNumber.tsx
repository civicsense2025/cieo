// src/primitives/BigNumber/BigNumber.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* BigNumber. Twin of CieoUI BigNumber. */
export interface BigNumberProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  value: string;
  label?: string;
  layout?: 'inline' | 'stacked';
}
export function BigNumber({ className, slotProps, value, label, layout = 'stacked' }: BigNumberProps) {
  return (<p {...customizePart(slotProps?.root, "cieo cieo-p-big-number", undefined, className)} data-layout={layout}><span className="cieo-p-big-number__value">{value}</span>{label ? <span className="cieo-p-big-number__label">{label}</span> : null}</p>);
}
