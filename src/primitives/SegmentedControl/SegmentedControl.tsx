// src/primitives/SegmentedControl/SegmentedControl.tsx
'use client';
/* SegmentedControl. Single-select pill of segments. Owns the picked value (controlled or not); segments follow it by their value key. */
import { createContext, useState, type ReactNode } from 'react';

export interface SegmentedControlContextValue {
  value?: string;
  onSelect?: (value: string) => void;
}

export const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

export interface SegmentedControlProps {
  /** Accessible name for the control (e.g. "View density"). Required. */
  label: string;
  /** Picked segment value when controlled. */
  value?: string;
  /** Initial picked value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly picked value. Host owns persistence. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function SegmentedControl({ label, value, defaultValue, onValueChange, children }: SegmentedControlProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function handleSelect(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div role="group" aria-label={label} className="cieo cieo-segmented-control">
      <SegmentedControlContext.Provider value={{ value: current, onSelect: handleSelect }}>
        {children}
      </SegmentedControlContext.Provider>
    </div>
  );
}
