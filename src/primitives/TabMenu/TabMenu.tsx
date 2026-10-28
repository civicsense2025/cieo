// src/primitives/TabMenu/TabMenu.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TabMenu. Menu-styled twin of TabList: same TabContext contract, vertical menu visuals. Host owns panels and persistence. */
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus } from '../../react/index.js';
import { TabContext } from '../TabList/TabList.js';

export interface TabMenuProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the menu (e.g. "Account sections"). Required. */
  label: string;
  /** Selected tab value when controlled. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. Host owns panels and persistence. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function TabMenu({ className, slotProps, label, value, defaultValue, onValueChange, children }: TabMenuProps) {
  const [internal, setInternal] = useState(defaultValue);
  const listRef = useRef<HTMLDivElement>(null);
  const current = value ?? internal;
  function handleSelect(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div ref={listRef} role="tablist" aria-label={label} data-variant="menu" onKeyDown={(e: KeyboardEvent) => { roveFocus(e, listRef.current, '[role="tab"]', { orientation: 'both', activate: true }); }} className="cieo cieo-tab-menu" {...customizePart(slotProps?.root, "cieo cieo-tab-menu", undefined, className)}>
      <TabContext.Provider value={{ value: current, onSelect: handleSelect }}>
        {children}
      </TabContext.Provider>
    </div>
  );
}
