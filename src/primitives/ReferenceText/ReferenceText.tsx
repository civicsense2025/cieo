// src/primitives/ReferenceText/ReferenceText.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ReferenceText. Section numbers and page counts in the mono reference style. Never a label. */
export interface ReferenceTextProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** What a screen reader hears instead, such as "Page 4 of 18". */
  spoken?: string;
  children: ReactNode;
}
/** Keeps a page count truthful: at least page 1, never past the total. */
export function pageBounds(page: number, total: number): [number, number] {
  const t = Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 1;
  const p = Number.isFinite(page) ? Math.min(Math.max(1, Math.floor(page)), t) : 1;
  return [p, t];
}
export function ReferenceText({ className, slotProps, spoken, children }: ReferenceTextProps) {
  return (<span {...customizePart(slotProps?.root, "cieo cieo-p-reference-text", undefined, className)} aria-label={spoken}>{children}</span>);
}
