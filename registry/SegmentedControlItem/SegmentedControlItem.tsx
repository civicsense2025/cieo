// src/primitives/SegmentedControlItem/SegmentedControlItem.tsx
'use client';
/* SegmentedControlItem. One segment inside SegmentedControl. Pressed when the control value equals its own value. */
import { useContext, type ReactNode } from 'react';
import { SegmentedControlContext } from '../SegmentedControl/SegmentedControl.js';

export interface SegmentedControlItemProps {
  /** Segment key matched against the control value. Required. */
  value: string;
  children: ReactNode;
}

export function SegmentedControlItem({ value, children }: SegmentedControlItemProps) {
  const control = useContext(SegmentedControlContext);
  const picked = control?.value === value;
  return (
    <button type="button" aria-pressed={picked} data-picked={picked} onClick={() => control?.onSelect?.(value)} className="cieo cieo-segmented-control-item">
      {children}
    </button>
  );
}
