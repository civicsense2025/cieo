// src/primitives/BottomSheetSwitcher/BottomSheetSwitcher.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* BottomSheetSwitcher. Named option list for a sheet. Host supplies real options; this owns layout + list semantics only. */
import type { ReactNode } from 'react';

export interface BottomSheetSwitcherProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the option list (e.g. "Share options"). Required. */
  label: string;
  children: ReactNode;
}

export function BottomSheetSwitcher({ className, slotProps, label, children }: BottomSheetSwitcherProps) {
  return (
    <div role="listbox" aria-label={label} className="cieo cieo-bottom-sheet-switcher" {...customizePart(slotProps?.root, "cieo cieo-bottom-sheet-switcher", undefined, className)}>
      {children}
    </div>
  );
}
