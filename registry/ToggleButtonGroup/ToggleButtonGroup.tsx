// src/primitives/ToggleButtonGroup/ToggleButtonGroup.tsx
'use client';
/* ToggleButtonGroup. Single- or multiple-select group of ToggleButtons via controllable state. */
import { createContext, useMemo, type JSX, type ReactNode } from 'react';
import { useControllableState } from '../../state/react.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ToggleButtonGroupContextValue {
  value?: string;
  values?: readonly string[];
  multiple?: boolean;
  isSelected?: (itemValue: string) => boolean;
  onSelect?: (value: string) => void;
}

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);

export interface ToggleButtonGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the group (e.g. "Text style"). Required. */
  label: string;
  /** Allow multiple buttons to be pressed simultaneously. Defaults to false. */
  multiple?: boolean;
  /** Selected button value (single) or values (multiple) when controlled. */
  value?: string | readonly string[];
  /** Initial selected value (single) or values (multiple) when uncontrolled. */
  defaultValue?: string | readonly string[];
  /** Called with the next selected value (single) or values array (multiple). */
  onValueChange?: ((value: string) => void) | ((value: string[]) => void);
  children: ReactNode;
}

function toList(val: string | readonly string[] | undefined): string[] {
  if (val === undefined) return [];
  return typeof val === 'string' ? [val] : [...val];
}

export function ToggleButtonGroup(
  props: ToggleButtonGroupProps & {
    multiple: true;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
  },
): JSX.Element;
export function ToggleButtonGroup(
  props: ToggleButtonGroupProps & {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  },
): JSX.Element;
export function ToggleButtonGroup({
  className,
  slotProps,
  label,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  children,
}: ToggleButtonGroupProps): JSX.Element {
  const [selected, setSelected] = useControllableState<string[]>({
    value: value !== undefined ? toList(value) : undefined,
    defaultValue: toList(defaultValue),
    onChange: (next) => {
      if (!onValueChange) return;
      if (multiple) (onValueChange as (v: string[]) => void)(next);
      else if (next[0] !== undefined) (onValueChange as (v: string) => void)(next[0]);
    },
  });

  const ctx = useMemo<ToggleButtonGroupContextValue>(
    () => ({
      value: selected[0],
      values: selected,
      multiple,
      isSelected: (item: string) => selected.includes(item),
      onSelect: (next: string) => {
        if (multiple) {
          setSelected((prev) => (prev.includes(next) ? prev.filter((x) => x !== next) : [...prev, next]));
        } else {
          setSelected([next]);
        }
      },
    }),
    [selected, multiple, setSelected],
  );

  return (
    <div
      role="group"
      aria-label={label}
      data-multiple={multiple || undefined}
      className="cieo cieo-toggle-button-group"
      {...customizePart(slotProps?.root, 'cieo cieo-toggle-button-group', undefined, className)}
    >
      <ToggleButtonGroupContext.Provider value={ctx}>{children}</ToggleButtonGroupContext.Provider>
    </div>
  );
}
