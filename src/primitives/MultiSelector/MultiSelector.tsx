// src/primitives/MultiSelector/MultiSelector.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* MultiSelector. Label plus a native multi-select. Renders the design-system .cieo-input so there is exactly one input style; this file owns the contract, not the paint. */
import { useId, type ReactNode } from 'react';

export interface MultiSelectorProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; input?: PrimitivePartProps };

  /** Visible label naming the set. Required. */
  label: string;
  /** Controlled selected values. Optional. */
  values?: string[];
  /** Host change hook with the full selected set. Optional. */
  onChange?: (values: string[]) => void;
  children: ReactNode;
}

export function MultiSelector({ className, slotProps, label, values, onChange, children }: MultiSelectorProps) {
  const id = useId();
  return (
    <div className="cieo cieo-p-multi-selector" {...customizePart(slotProps?.root, "cieo cieo-p-multi-selector", undefined, className)}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        multiple
        value={values}
        onChange={(e) => onChange?.([...e.currentTarget.selectedOptions].map((o) => o.value))}
        className="cieo-input" {...customizePart(slotProps?.input, "cieo-input")}
      >
        {children}
      </select>
    </div>
  );
}
