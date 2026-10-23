// src/primitives/ActionBar/ActionBar.tsx
'use client';
/* ActionBar. A toolbar for a row of action buttons under a post: one tab stop, arrow keys move between buttons. The host owns the buttons. */
import { useEffect, useRef, type ReactNode } from 'react';
import { enabledIn, roveFocus, roveIndex } from '../../react/index.js';

const ITEMS = 'button';

/** Index a horizontal toolbar moves to for a key, or null when the key does nothing. Wraps at both ends. */
export function actionBarIndex(key: string, current: number, count: number): number | null {
  return roveIndex(key, current, count, { orientation: 'horizontal', loop: true });
}

export interface ActionBarProps {
  /** Accessible name for the toolbar ("Post actions"). Required. */
  label: string;
  /** The buttons, in order. */
  children: ReactNode;
  /** Passed to the layout as data-size so buttons and gaps stay consistent. Defaults to md. */
  size?: 'sm' | 'md';
  /** start packs the buttons left; between spreads them across the row. Defaults to start. */
  align?: 'start' | 'between';
}

export function ActionBar({ label, children, size = 'md', align = 'start' }: ActionBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(0);
  const sync = () => {
    const items = enabledIn(ref.current, ITEMS);
    const at = Math.min(active.current, items.length - 1);
    items.forEach((el, i) => el.setAttribute('tabindex', i === at ? '0' : '-1'));
  };
  useEffect(sync);
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      data-size={size}
      data-align={align}
      className="cieo cieo-action-bar"
      onFocus={(e) => {
        const items = enabledIn(ref.current, ITEMS);
        const i = items.findIndex((el) => el === e.target || el.contains(e.target as Node));
        if (i >= 0) {
          active.current = i;
          sync();
        }
      }}
      onKeyDown={(e) => {
        if (e.defaultPrevented) return;
        roveFocus(e, ref.current, ITEMS, { orientation: 'horizontal', loop: true });
      }}
    >
      {children}
    </div>
  );
}
