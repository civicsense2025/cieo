// src/primitives/SelectableCard/SelectableCard.tsx
'use client';
/* SelectableCard. Checkable card toggled by click, Enter, or Space. Host owns selection state. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { KeyboardEvent, ReactNode } from 'react';

export interface SelectableCardProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the option (e.g. "Monthly billing"). Required. */
  label: string;
  /** Whether the card is selected. Defaults to false. */
  selected?: boolean;
  /** Called when the card is toggled. Optional. */
  onSelect?: () => void;
  children: ReactNode;
}

export function SelectableCard({ label, selected = false, onSelect, children, className, slotProps }: SelectableCardProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  };
  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      tabIndex={0}
      data-selected={selected}
      onClick={() => onSelect?.()}
      onKeyDown={onKeyDown}
      className="cieo cieo-selectable-card"
     {...customizePart(slotProps?.root, "cieo cieo-selectable-card", undefined, className)}>
      {children}
    </div>
  );
}
