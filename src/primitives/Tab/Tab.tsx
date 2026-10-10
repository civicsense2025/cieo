// src/primitives/Tab/Tab.tsx
'use client';
/* Tab. One tab inside TabList (or TabMenu). Selected when the shared value equals its own value; standalone it renders a plain button. */
import { useContext, type ReactNode } from 'react';
import { TabContext } from '../TabList/TabList.js';

export interface TabProps {
  /** Tab key matched against the shared value. Required. */
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const tabs = useContext(TabContext);
  if (tabs === null) {
    return (
      <button type="button" className="cieo cieo-tab">
        {children}
      </button>
    );
  }
  const selected = tabs.value === value;
  return (
    <button type="button" role="tab" aria-selected={selected} data-selected={selected} onClick={() => tabs.onSelect?.(value)} className="cieo cieo-tab">
      {children}
    </button>
  );
}
