// src/primitives/SelectorOption/SelectorOption.tsx
'use client';
/* SelectorOption. Native option wrapper for Selector-family selects. No paint of its own; the select owns it. */

export interface SelectorOptionProps {
  /** Submitted value. Required. */
  value: string;
  /** Visible text. Defaults to the value. */
  label?: string;
  /** Whether the option is unavailable. Defaults to false. */
  disabled?: boolean;
}

export function SelectorOption({ value, label, disabled = false }: SelectorOptionProps) {
  return (
    <option value={value} disabled={disabled}>
      {label ?? value}
    </option>
  );
}
