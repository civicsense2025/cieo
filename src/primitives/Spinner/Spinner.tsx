'use client';
/* Spinner. Loading indicator with an accessible label. CSS rotation only; rests under reduced motion. */
export interface SpinnerProps { label?: string; size?: 'sm' | 'md'; }
export function Spinner({ label = 'Loading', size = 'md' }: SpinnerProps) {
  return (<span role="status" aria-label={label} data-size={size} className="cieo cieo-p-spinner"><span aria-hidden="true" className="cieo-p-spinner-ring" /></span>);
}
