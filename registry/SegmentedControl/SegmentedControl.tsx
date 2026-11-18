// src/primitives/SegmentedControl/SegmentedControl.tsx
'use client';
/* SegmentedControl. Single-select pill of segments with sliding useEdges indicator and arrow-key roving focus. */
import { createContext, useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus, useEdges } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface SegmentedControlContextValue {
  value?: string;
  onSelect?: (value: string) => void;
  registerItem?: (value: string, el: HTMLElement | null) => void;
}

export const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

export interface SegmentedControlProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; indicator?: PrimitivePartProps };
  /** Accessible name for the control (e.g. "View density"). Required. */
  label: string;
  /** Picked segment value when controlled. */
  value?: string;
  /** Initial picked value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly picked value. Host owns persistence. */
  onValueChange?: (value: string) => void;
  /** False renders the sliding indicator end state instantly. Defaults to true. */
  motion?: boolean;
  children: ReactNode;
}

export function SegmentedControl({
  className,
  slotProps,
  label,
  value,
  defaultValue,
  onValueChange,
  motion,
  children,
}: SegmentedControlProps) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const itemsRef = useRef(new Map<string, HTMLElement>());
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ left: 0, width: 0 });

  const registerItem = useCallback((key: string, el: HTMLElement | null) => {
    if (el) itemsRef.current.set(key, el);
    else itemsRef.current.delete(key);
  }, []);

  useLayoutEffect(() => {
    function measure() {
      const el = current !== undefined ? itemsRef.current.get(current) : undefined;
      if (el) {
        const left = el.offsetLeft;
        const width = el.offsetWidth;
        setBox((p) => (p.left === left && p.width === width ? p : { left, width }));
      }
    }
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    const picked = current !== undefined ? itemsRef.current.get(current) : undefined;
    if (picked) observer.observe(picked);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [current]);

  useEdges(indicatorRef, `${current ?? ''}:${box.left}:${box.width}`, { disabled: motion === false });

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      data-motion={motion === false ? 'off' : undefined}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        roveFocus(e, rootRef.current, '.cieo-segmented-control-item', { orientation: 'horizontal', activate: true });
      }}
      className="cieo cieo-segmented-control"
      {...customizePart(slotProps?.root, 'cieo cieo-segmented-control', undefined, className)}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="cieo-segmented-control-indicator"
        {...customizePart(
          slotProps?.indicator,
          'cieo-segmented-control-indicator',
          { left: box.left, width: box.width, opacity: box.width > 0 ? 1 : 0 },
        )}
        style={{ ...slotProps?.indicator?.style, left: box.left, width: box.width, opacity: box.width > 0 ? 1 : 0 }}
      />
      <SegmentedControlContext.Provider value={{ value: current, onSelect: (next) => setCurrent(next), registerItem }}>
        {children}
      </SegmentedControlContext.Provider>
    </div>
  );
}
