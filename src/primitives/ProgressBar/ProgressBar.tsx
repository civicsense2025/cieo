'use client';
/* ProgressBar. Task progress with native semantics. Renders <progress> styled by the design system; this file owns the contract, not the paint. */
export interface ProgressBarProps { value: number; max?: number; label: string; }
export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  return (<progress value={value} max={max} aria-label={label} className="cieo cieo-progress" />);
}
