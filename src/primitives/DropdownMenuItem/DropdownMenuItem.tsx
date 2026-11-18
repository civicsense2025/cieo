// src/primitives/DropdownMenuItem/DropdownMenuItem.tsx
'use client';
/* DropdownMenuItem. Single menu action. Label or children supply the text; supports asChild + React 19 ref. */
import { useContext, type ComponentPropsWithRef, type ReactNode, type Ref } from 'react';
import { DropdownMenuContext } from '../DropdownMenu/DropdownMenu.js';
import { Slot } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface DropdownMenuItemProps extends Omit<ComponentPropsWithRef<'button'>, 'onSelect' | 'children'> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name when children carry no readable text. */
  label?: string;
  /** Removes the item from selection. Defaults to false. */
  disabled?: boolean;
  /** Called when the host should run the action (and usually close the menu). */
  onSelect?: () => void;
  /** Polymorphic child rendering. */
  asChild?: boolean;
  children?: ReactNode;
}

export function DropdownMenuItem({
  className,
  slotProps,
  label,
  disabled = false,
  onSelect,
  asChild = false,
  ref,
  style,
  children,
  ...rest
}: DropdownMenuItemProps) {
  const menu = useContext(DropdownMenuContext);
  const customized = customizePart(slotProps?.root, 'cieo cieo-dropdown-menu-item', style, className);
  const handleSelect = () => {
    if (disabled) return;
    onSelect?.();
    menu?.close();
  };
  if (asChild) {
    return (
      <Slot
        asChild
        ref={ref as Ref<HTMLElement>}
        {...(rest as Record<string, unknown>)}
        role="menuitem"
        aria-label={label}
        aria-disabled={disabled || undefined}
        onClick={handleSelect}
        className="cieo cieo-dropdown-menu-item"
        style={style}
        {...customized}
      >
        {children}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      {...rest}
      type="button"
      role="menuitem"
      aria-label={label}
      disabled={disabled}
      onClick={handleSelect}
      className="cieo cieo-dropdown-menu-item"
      style={style}
      {...customized}
    >
      {children ?? label}
    </button>
  );
}
