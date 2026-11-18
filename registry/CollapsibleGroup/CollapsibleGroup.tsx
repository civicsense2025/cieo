'use client';
/* CollapsibleGroup. role=group accordion shell supporting single and multiple open items via value/defaultValue/onValueChange. */
import { createContext, useMemo, type JSX, type ReactNode } from 'react';
import { useControllableState } from '../../state/react.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CollapsibleGroupContextValue {
  isOpen: (itemValue: string) => boolean;
  toggleItem: (itemValue: string) => void;
}

export const CollapsibleGroupContext = createContext<CollapsibleGroupContextValue | null>(null);

export interface CollapsibleGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the group. Required. */
  label: string;
  /** Allow multiple items open simultaneously. Defaults to false when coordinating by value. */
  multiple?: boolean;
  /** Optional Radix-style mode alias ('single' | 'multiple'). */
  type?: 'single' | 'multiple';
  /** In single mode, whether pressing the open item collapses it. Defaults to true. */
  collapsible?: boolean;
  /** Controlled open item key (single) or keys (multiple). */
  value?: string | readonly string[];
  /** Initial open item key (single) or keys (multiple) when uncontrolled. */
  defaultValue?: string | readonly string[];
  /** Called with the next open key (single) or keys array (multiple). */
  onValueChange?: ((value: string) => void) | ((value: string[]) => void);
  /** Collapsible children. Required. */
  children: ReactNode;
}

function toArray(val: string | readonly string[] | undefined): string[] {
  if (val === undefined) return [];
  if (typeof val === 'string') return val.length > 0 ? [val] : [];
  return [...val];
}

export function CollapsibleGroup(
  props: CollapsibleGroupProps & {
    multiple: true;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
  },
): JSX.Element;
export function CollapsibleGroup(
  props: CollapsibleGroupProps & {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  },
): JSX.Element;
export function CollapsibleGroup({
  className,
  slotProps,
  label,
  multiple,
  type,
  collapsible = true,
  value,
  defaultValue,
  onValueChange,
  children,
}: CollapsibleGroupProps): JSX.Element {
  const isMulti = multiple ?? type === 'multiple';
  const coordinated =
    value !== undefined || defaultValue !== undefined || onValueChange !== undefined || multiple !== undefined || type !== undefined;

  const controlledArr = value !== undefined ? toArray(value) : undefined;
  const [openIds, setOpenIds] = useControllableState<string[]>({
    value: controlledArr,
    defaultValue: toArray(defaultValue),
    onChange: (next) => {
      if (!onValueChange) return;
      if (isMulti) (onValueChange as (v: string[]) => void)(next);
      else (onValueChange as (v: string) => void)(next[0] ?? '');
    },
  });

  const ctx = useMemo<CollapsibleGroupContextValue | null>(() => {
    if (!coordinated) return null;
    return {
      isOpen: (id: string) => openIds.includes(id),
      toggleItem: (id: string) => {
        if (isMulti) {
          setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        } else {
          setOpenIds((prev) => (prev[0] === id ? (collapsible ? [] : prev) : [id]));
        }
      },
    };
  }, [coordinated, openIds, isMulti, collapsible, setOpenIds]);

  return (
    <div
      role="group"
      aria-label={label}
      data-multiple={coordinated ? isMulti : undefined}
      className="cieo cieo-collapsible-group"
      {...customizePart(slotProps?.root, 'cieo cieo-collapsible-group', undefined, className)}
    >
      <CollapsibleGroupContext.Provider value={ctx}>{children}</CollapsibleGroupContext.Provider>
    </div>
  );
}
