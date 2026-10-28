// src/primitives/ToggleButtonGroup/ToggleButtonGroup.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ToggleButtonGroup. Single-select group of ToggleButtons. Owns the selected value (controlled or not); buttons follow it by their value key. */
import { createContext, useState, type ReactNode } from 'react';

export interface ToggleButtonGroupContextValue {
  value?: string;
  onSelect?: (value: string) => void;
}

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);

export interface ToggleButtonGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group (e.g. "Text style"). Required. */
  label: string;
  /** Selected button value when controlled. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. Host owns persistence. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function ToggleButtonGroup({ className, slotProps, label, value, defaultValue, onValueChange, children }: ToggleButtonGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function handleSelect(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div role="group" aria-label={label} className="cieo cieo-toggle-button-group" {...customizePart(slotProps?.root, "cieo cieo-toggle-button-group", undefined, className)}>
      <ToggleButtonGroupContext.Provider value={{ value: current, onSelect: handleSelect }}>
        {children}
      </ToggleButtonGroupContext.Provider>
    </div>
  );
}
