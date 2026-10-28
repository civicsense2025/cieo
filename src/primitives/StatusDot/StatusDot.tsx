// src/primitives/StatusDot/StatusDot.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* StatusDot. Bare presence dot, named only when labelled. Pair with visible text. */
export type StatusDotStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface StatusDotProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** State shown by the dot. Defaults to default. */
  status?: StatusDotStatus;
  /** Accessible name. Omit only beside visible status text. */
  label?: string;
}

export function StatusDot({ className, slotProps, status = 'default', label }: StatusDotProps) {
  if (label) {
    return <span role="img" aria-label={label} data-status={status} className="cieo cieo-p-status-dot" {...customizePart(slotProps?.root, "cieo cieo-p-status-dot", undefined, className)} />;
  }
  return <span aria-hidden="true" data-status={status} className="cieo cieo-p-status-dot" {...customizePart(slotProps?.root, "cieo cieo-p-status-dot", undefined, className)} />;
}
