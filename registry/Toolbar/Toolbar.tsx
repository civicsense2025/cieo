'use client';
/* Toolbar. Horizontal action bar with optional title. Host owns the actions. */
import type { ReactNode } from 'react';
export interface ToolbarProps { label: string; title?: ReactNode; children: ReactNode; }
export function Toolbar({ label, title, children }: ToolbarProps) {
  return (<div role="toolbar" aria-label={label} className="cieo cieo-toolbar">{title ? <span className="cieo-toolbar-title">{title}</span> : null}<span className="cieo-toolbar-actions">{children}</span></div>);
}
