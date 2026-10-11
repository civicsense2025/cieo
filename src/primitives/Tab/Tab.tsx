// src/primitives/Tab/Tab.tsx
'use client';
/* Tab. One tab inside TabList (or TabMenu). Selected when the shared value equals its own value; standalone it renders a plain button. */
import { useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { TabContext } from '../TabList/TabList.js';

export interface TabProps {
  /** Tab key matched against the shared value. Required. */
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const tabs = useContext(TabContext);
  const ref = useRef<HTMLButtonElement>(null);
  const selected = tabs?.value === value;
  const registerTab = tabs?.registerTab;
  useLayoutEffect(() => {
    if (!selected || !registerTab) return;
    const el = ref.current;
    if (!el) return;
    registerTab(value, el);
    return () => registerTab(value, null);
  }, [selected, registerTab, value]);
  if (tabs === null) {
    return (
      <button type="button" className="cieo cieo-tab">
        {children}
      </button>
    );
  }
  return (
    <button ref={ref} type="button" role="tab" aria-selected={selected} data-selected={selected} onClick={() => tabs.onSelect?.(value)} className="cieo cieo-tab">
      {children}
    </button>
  );
}
