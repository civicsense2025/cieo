// src/primitives/StatusDot/StatusDot.tsx
'use client';
/* StatusDot. Bare presence dot, named only when labelled. Pair with visible text. */
export type StatusDotStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface StatusDotProps {
  /** State shown by the dot. Defaults to default. */
  status?: StatusDotStatus;
  /** Accessible name. Omit only beside visible status text. */
  label?: string;
}

export function StatusDot({ status = 'default', label }: StatusDotProps) {
  if (label) {
    return <span role="img" aria-label={label} data-status={status} className="cieo cieo-p-status-dot" />;
  }
  return <span aria-hidden="true" data-status={status} className="cieo cieo-p-status-dot" />;
}
