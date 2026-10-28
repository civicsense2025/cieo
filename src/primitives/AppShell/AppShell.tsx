// src/primitives/AppShell/AppShell.tsx
'use client';
/* AppShell. App frame with nav + main slots: SideNav in nav, page in default. Host owns routing and collapse; this owns the two-column frame only. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface AppShellProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; navigation?: PrimitivePartProps; content?: PrimitivePartProps };
  /** Navigation rail (SideNav). Optional, at most one. */
  nav?: ReactNode;
  /** Main page content. Required. */
  children: ReactNode;
}

export function AppShell({ nav, children, className, slotProps }: AppShellProps) {
  return (
    <div className="cieo cieo-app-shell" {...customizePart(slotProps?.root, "cieo cieo-app-shell", undefined, className)}>
      {nav ? <div className="cieo-app-shell-nav" {...customizePart(slotProps?.navigation, "cieo-app-shell-nav", undefined)}>{nav}</div> : null}
      <div className="cieo-app-shell-main" {...customizePart(slotProps?.content, "cieo-app-shell-main", undefined)}>{children}</div>
    </div>
  );
}
