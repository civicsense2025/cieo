// src/primitives/TabList/TabList.tsx
'use client';
/* TabList. Tab row owning the selected value (controlled or not). Exports TabContext for Tab and TabMenu. */
import { createContext, useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus, useEdges } from '../../react/index.js';

export interface TabContextValue {
  value?: string;
  onSelect?: (value: string) => void;
  registerTab?: (value: string, el: HTMLButtonElement | null) => void;
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
  const tabsRef = useRef(new Map<string, HTMLButtonElement>());
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ left: 0, width: 0 });
  function handleSelect(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  const registerTab = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) tabsRef.current.set(key, el);
    else tabsRef.current.delete(key);
  }, []);
  useLayoutEffect(() => {
    function measure() {
      const el = current !== undefined ? tabsRef.current.get(current) : undefined;
      /* offsetLeft/offsetWidth read layout, so skip the state write (and its re-render) when nothing moved. */
      if (el) {
        const left = el.offsetLeft;
        const width = el.offsetWidth;
        setStyle((p: { left: number; width: number }) => (p.left === left && p.width === width ? p : { left, width }));
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [current]);
  useEdges(indicatorRef, current, { disabled: motion === false });
  return (
    <div ref={listRef} role="tablist" aria-label={label} onKeyDown={(e: KeyboardEvent) => { roveFocus(e, listRef.current, '[role="tab"]', { orientation: 'horizontal', activate: true }); }} className="cieo cieo-tab-list" data-motion={motion === false ? 'off' : undefined}>
      <TabContext.Provider value={{ value: current, onSelect: handleSelect, registerTab }}>
        {children}
      </TabContext.Provider>
      <span ref={indicatorRef} className="cieo-tab-indicator" style={{ left: style.left, width: style.width }} aria-hidden="true" />
    </div>
  );
}
