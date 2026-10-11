// src/primitives/DropdownMenuRadioGroup/DropdownMenuRadioGroup.tsx
'use client';
/* DropdownMenuRadioGroup. Single-select group of radio rows in a menu. Owns the picked value (controlled or not); items follow it by their value key. */
import { createContext, useState, type ReactNode } from 'react';

export interface DropdownMenuRadioGroupContextValue {
  value?: string;
  onSelect?: (value: string) => void;
}

export const DropdownMenuRadioGroupContext = createContext<DropdownMenuRadioGroupContextValue | null>(null);

export interface DropdownMenuRadioGroupProps {
  /** Accessible name when the group needs its own announcement. Optional; the menu label usually covers it. */
  label?: string;
  /** Picked item value when controlled. */
  value?: string;
  /** Initial picked value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly picked value. Host owns persistence. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function DropdownMenuRadioGroup({ label, value, defaultValue, onValueChange, children }: DropdownMenuRadioGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function handleSelect(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div role="group" aria-label={label} className="cieo cieo-dropdown-menu-radio-group">
      <DropdownMenuRadioGroupContext.Provider value={{ value: current, onSelect: handleSelect }}>
        {children}
      </DropdownMenuRadioGroupContext.Provider>
    </div>
  );
}
