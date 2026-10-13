// src/primitives/MobileNavToggle/MobileNavToggle.tsx
'use client';
/* MobileNavToggle. Button that opens the drawer; host owns expanded state. */

export interface MobileNavToggleProps {
  /** Whether the drawer is open. Required. */
  expanded: boolean;
  /** Toggle handler. */
  onToggle?: () => void;
  /** Accessible label. Defaults to Open navigation. */
  label?: string;
}

export function MobileNavToggle({ expanded, onToggle, label = 'Open navigation' }: MobileNavToggleProps) {
  return (
    <button type="button" aria-expanded={expanded} aria-label={label} onClick={onToggle} className="cieo cieo-mobile-nav-toggle">
      {label}
    </button>
  );
}
