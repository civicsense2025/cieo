'use client';
/* Tooltip. Hover/focus hint for icon-only controls. CSS reveal only; the trigger keeps its own accessible name. */
import { cloneElement, isValidElement, useId, type ReactNode } from 'react';
export interface TooltipProps { text: string; children: ReactNode; }
export function Tooltip({ text, children }: TooltipProps) {
  const id = useId();
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': id })
    : <span aria-describedby={id} className="cieo-p-tooltip-trigger">{children}</span>;
  return (<span className="cieo cieo-p-tooltip">
    {trigger}
    <span id={id} role="tooltip" className="cieo-p-tooltip-bubble">{text}</span>
  </span>);
}
