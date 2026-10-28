// src/primitives/ToggleButton/ToggleButton.tsx
'use client';
/* ToggleButton. Two-state press button. Standalone it reports pressed via prop; inside ToggleButtonGroup it follows the group value by its value key. */
import { useContext, useState, type ReactNode } from 'react';
import { ToggleButtonGroupContext } from '../ToggleButtonGroup/ToggleButtonGroup.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ToggleButtonProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the button; must match the visible text. Required. */
  label: string;
  /** Pressed state when used standalone. Defaults to false; inside a group the group value wins. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. Defaults to false. */
  defaultPressed?: boolean;
  /** Group participation key. Only read inside ToggleButtonGroup; ignored standalone. */
  value?: string;
  /** Called with the next pressed state when used standalone. */
  onPressedChange?: (pressed: boolean) => void;
  children: ReactNode;
}

export function ToggleButton({ className, slotProps, label, pressed, defaultPressed = false, value, onPressedChange, children }: ToggleButtonProps) {
  const group = useContext(ToggleButtonGroupContext);
  const [internal, setInternal] = useState(defaultPressed);
  const own = pressed ?? internal;
  const inGroup = group !== null && value !== undefined;
  const isPressed = inGroup ? group.value === value : own;
  function handleClick() {
    if (inGroup) {
      group.onSelect?.(value as string);
      return;
    }
    if (pressed === undefined) setInternal(!own);
    onPressedChange?.(!own);
  }
  return (
    <button type="button" aria-pressed={isPressed} aria-label={label} data-pressed={isPressed} onClick={handleClick} className="cieo cieo-toggle-button" {...customizePart(slotProps?.root, "cieo cieo-toggle-button", undefined, className)}>
      {children}
    </button>
  );
}
