// src/primitives/TabList/TabList.tsx
'use client';
/* TabList. Tab row owning the selected value (controlled or not). Exports TabContext for Tab and TabMenu. */
import { createContext, useState, type ReactNode } from 'react';

export interface TabContextValue {
  value?: string;
  onSelect?: (value: string) => void;
}

export const TabContext = createContext<TabContextValue | null>(null);

export interface TabListProps {
  /** Accessible name for the tab row (e.g. "Settings sections"). Required. */
  label: string;
  /** Selected tab value when controlled. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. Host owns panels and persistence. */
  onValueChange?: (value: string) => void;
  /** False renders the end state instantly. Defaults to true. */
  motion?: boolean;
  children: ReactNode;
}

export function TabList({ label, value, defaultValue, onValueChange, motion, children }: TabListProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function handleSelect(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div role="tablist" aria-label={label} className="cieo cieo-tab-list" data-motion={motion === false ? 'off' : undefined}>
      <TabContext.Provider value={{ value: current, onSelect: handleSelect }}>
        {children}
      </TabContext.Provider>
    </div>
  );
}
