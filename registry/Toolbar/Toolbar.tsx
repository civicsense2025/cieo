'use client';
/* Toolbar. Horizontal action bar with optional title. Arrow, Home and End keys move focus between its controls. */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus } from '../../react/index.js';
export interface ToolbarProps { label: string; title?: ReactNode; children: ReactNode; }
const CONTROLS = 'button,[href],input,select,textarea,[role="button"],[tabindex="0"]';
export function Toolbar({ label, title, children }: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).matches?.('input,select,textarea')) return;
    roveFocus(e, ref.current, CONTROLS, { orientation: 'horizontal' });
  };
  return (<div ref={ref} role="toolbar" aria-label={label} onKeyDown={onKeyDown} className="cieo cieo-toolbar">{title ? <span className="cieo-toolbar-title">{title}</span> : null}<span className="cieo-toolbar-actions">{children}</span></div>);
}
