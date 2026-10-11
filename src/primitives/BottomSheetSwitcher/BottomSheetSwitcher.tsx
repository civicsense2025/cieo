// src/primitives/BottomSheetSwitcher/BottomSheetSwitcher.tsx
'use client';
/* BottomSheetSwitcher. Named option list for a sheet. Host supplies real options; this owns layout + list semantics only. */
import type { ReactNode } from 'react';

export interface BottomSheetSwitcherProps {
  /** Accessible name for the option list (e.g. "Share options"). Required. */
  label: string;
  children: ReactNode;
}

export function BottomSheetSwitcher({ label, children }: BottomSheetSwitcherProps) {
  return (
    <div role="listbox" aria-label={label} className="cieo cieo-bottom-sheet-switcher">
      {children}
    </div>
  );
}
