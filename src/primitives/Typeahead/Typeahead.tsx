// src/primitives/Typeahead/Typeahead.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Typeahead. Controlled combobox shell: label plus input plus host-filtered matches. Host owns filtering; open reflects match presence. */
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus } from '../../react/index.js';

export interface TypeaheadProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; input?: PrimitivePartProps; list?: PrimitivePartProps };

  /** Visible label naming the field. Required. */
  label: string;
  /** Current text. Optional. */
  value?: string;
  /** Host text hook. Optional. */
  onChange?: (value: string) => void;
  /** Whether the match list shows; host sets from match presence. Optional. */
  open?: boolean;
  /** Asks the host to open or close the list (Escape closes, ArrowDown opens). Optional. */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Typeahead({ className, slotProps, label, value, onChange, open = false, onOpenChange, children }: TypeaheadProps) {
  const inputId = useId();
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && open) { e.preventDefault(); onOpenChange?.(false); return; }
    if (e.key === 'ArrowDown' && !open) { e.preventDefault(); onOpenChange?.(true); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') roveFocus(e, listRef.current, '[role="option"]');
  };
  const onListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); onOpenChange?.(false); (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement | null)?.focus(); return; }
    roveFocus(e, listRef.current, '[role="option"]');
  };
  return (
    <div className="cieo cieo-p-typeahead" {...customizePart(slotProps?.root, "cieo cieo-p-typeahead", undefined, className)}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        className="cieo-p-typeahead-input" {...customizePart(slotProps?.input, "cieo-p-typeahead-input")}
      />
      {open ? (
        <div ref={listRef} role="listbox" id={listId} onKeyDown={onListKeyDown} className="cieo-p-typeahead-list" {...customizePart(slotProps?.list, "cieo-p-typeahead-list")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
