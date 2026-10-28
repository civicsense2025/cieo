// src/primitives/SelectorOption/SelectorOption.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* SelectorOption. Native option wrapper for Selector-family selects. No paint of its own; the select owns it. */

export interface SelectorOptionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Submitted value. Required. */
  value: string;
  /** Visible text. Defaults to the value. */
  label?: string;
  /** Whether the option is unavailable. Defaults to false. */
  disabled?: boolean;
}

export function SelectorOption({ className, slotProps, value, label, disabled = false }: SelectorOptionProps) {
  return (
    <option value={value} disabled={disabled} {...customizePart(slotProps?.root, undefined, undefined, className)}>
      {label ?? value}
    </option>
  );
}
