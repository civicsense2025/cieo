// src/primitives/MobileNavToggle/MobileNavToggle.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* MobileNavToggle. Button that opens the drawer; host owns expanded state. */

export interface MobileNavToggleProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Whether the drawer is open. Required. */
  expanded: boolean;
  /** Toggle handler. */
  onToggle?: () => void;
  /** Accessible label. Defaults to Open navigation. */
  label?: string;
}

export function MobileNavToggle({ className, slotProps, expanded, onToggle, label = 'Open navigation' }: MobileNavToggleProps) {
  return (
    <button type="button" aria-expanded={expanded} aria-label={label} onClick={onToggle} className="cieo cieo-mobile-nav-toggle" {...customizePart(slotProps?.root, "cieo cieo-mobile-nav-toggle", undefined, className)}>
      {label}
    </button>
  );
}
