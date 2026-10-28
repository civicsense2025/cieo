// src/primitives/SideNavCollapseButton/SideNavCollapseButton.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* SideNavCollapseButton. Button that toggles the rail; host owns expanded state. */

export interface SideNavCollapseButtonProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Whether the rail is expanded. Required. */
  expanded: boolean;
  /** Toggle handler. */
  onToggle?: () => void;
  /** Accessible label. Defaults to Collapse navigation. */
  label?: string;
}

export function SideNavCollapseButton({ className, slotProps, expanded, onToggle, label = 'Collapse navigation' }: SideNavCollapseButtonProps) {
  return (
    <button type="button" aria-expanded={expanded} aria-label={label} onClick={onToggle} className="cieo cieo-side-nav-collapse-button" {...customizePart(slotProps?.root, "cieo cieo-side-nav-collapse-button", undefined, className)}>
      {label}
    </button>
  );
}
