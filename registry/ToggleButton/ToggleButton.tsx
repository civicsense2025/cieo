// src/primitives/ToggleButton/ToggleButton.tsx
'use client';
/* ToggleButton. Two-state press button. Standalone it reports pressed via prop; inside ToggleButtonGroup it follows the group value by its value key. */
import { useContext, type ReactNode } from 'react';
import { ToggleButtonGroupContext } from '../ToggleButtonGroup/ToggleButtonGroup.js';

export interface ToggleButtonProps {
  /** Accessible name for the button; must match the visible text. Required. */
  label: string;
  /** Pressed state when used standalone. Defaults to false; inside a group the group value wins. */
  pressed?: boolean;
  /** Group participation key. Only read inside ToggleButtonGroup; ignored standalone. */
  value?: string;
  /** Called with the next pressed state when used standalone. */
  onPressedChange?: (pressed: boolean) => void;
  children: ReactNode;
}

export function ToggleButton({ label, pressed = false, value, onPressedChange, children }: ToggleButtonProps) {
  const group = useContext(ToggleButtonGroupContext);
  const inGroup = group !== null && value !== undefined;
  const isPressed = inGroup ? group.value === value : pressed;
  function handleClick() {
    if (inGroup) {
      group.onSelect?.(value as string);
      return;
    }
    onPressedChange?.(!pressed);
  }
  return (
    <button type="button" aria-pressed={isPressed} aria-label={label} data-pressed={isPressed} onClick={handleClick} className="cieo cieo-toggle-button">
      {children}
    </button>
  );
}
