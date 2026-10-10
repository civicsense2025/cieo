'use client';
/* Divider. Thematic break between sections. Decorative unless given a label. */
export interface DividerProps { label?: string; }
export function Divider({ label }: DividerProps) {
  return (<hr aria-label={label} className="cieo cieo-p-divider" />);
}
