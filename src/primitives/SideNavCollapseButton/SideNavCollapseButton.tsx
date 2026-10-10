// src/primitives/SideNavCollapseButton/SideNavCollapseButton.tsx
'use client';
/* SideNavCollapseButton. Button that toggles the rail; host owns expanded state. */

export interface SideNavCollapseButtonProps {
  /** Whether the rail is expanded. Required. */
  expanded: boolean;
  /** Toggle handler. */
  onToggle?: () => void;
  /** Accessible label. Defaults to Collapse navigation. */
  label?: string;
}

export function SideNavCollapseButton({ expanded, onToggle, label = 'Collapse navigation' }: SideNavCollapseButtonProps) {
  return (
    <button type="button" aria-expanded={expanded} aria-label={label} onClick={onToggle} className="cieo cieo-side-nav-collapse-button">
      {label}
    </button>
  );
}
