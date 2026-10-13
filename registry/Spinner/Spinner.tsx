'use client';
/* Spinner. Loading indicator with an accessible label. CSS rotation only; rests under reduced motion. */
export interface SpinnerProps { label?: string; size?: 'sm' | 'md'; /** False stops rotation via data-motion="off". Defaults to true. */ motion?: boolean; }
export function Spinner({ label = 'Loading', size = 'md', motion }: SpinnerProps) {
  return (<span role="status" aria-label={label} data-size={size} data-motion={motion === false ? 'off' : undefined} className="cieo cieo-p-spinner"><span aria-hidden="true" className="cieo-p-spinner-ring" /></span>);
}
