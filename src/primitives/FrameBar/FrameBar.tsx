// src/primitives/FrameBar/FrameBar.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* FrameBar. Leading and trailing pieces along a frame's edge; wraps instead of truncating. */
export interface FrameBarProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  leading: ReactNode;
  trailing?: ReactNode;
  edge?: 'top' | 'bottom';
}
export function FrameBar({ className, slotProps, leading, trailing, edge = 'top' }: FrameBarProps) {
  return (<div {...customizePart(slotProps?.root, "cieo cieo-p-frame-bar", undefined, className)} data-edge={edge}><div className="cieo-p-frame-bar__leading">{leading}</div>{trailing ? <div className="cieo-p-frame-bar__trailing">{trailing}</div> : null}</div>);
}
