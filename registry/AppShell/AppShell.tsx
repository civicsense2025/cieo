// src/primitives/AppShell/AppShell.tsx
'use client';
/* AppShell. App frame with nav + main slots: SideNav in nav, page in default. Host owns routing and collapse; this owns the two-column frame only. */
import type { ReactNode } from 'react';

export interface AppShellProps {
  /** Navigation rail (SideNav). Optional, at most one. */
  nav?: ReactNode;
  /** Main page content. Required. */
  children: ReactNode;
}

export function AppShell({ nav, children }: AppShellProps) {
  return (
    <div className="cieo cieo-app-shell">
      {nav ? <div className="cieo-app-shell-nav">{nav}</div> : null}
      <div className="cieo-app-shell-main">{children}</div>
    </div>
  );
}
