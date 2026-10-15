// src/primitives/Typeahead/Typeahead.tsx
'use client';
/* Typeahead. Controlled combobox shell: label plus input plus host-filtered matches. Host owns filtering; open reflects match presence. */
import { useId, type ReactNode } from 'react';

export interface TypeaheadProps {
  /** Visible label naming the field. Required. */
  label: string;
  /** Current text. Optional. */
  value?: string;
  /** Host text hook. Optional. */
  onChange?: (value: string) => void;
  /** Whether the match list shows; host sets from match presence. Optional. */
  open?: boolean;
  children: ReactNode;
}

export function Typeahead({ label, value, onChange, open = false, children }: TypeaheadProps) {
  const inputId = useId();
  const listId = useId();
  return (
    <div className="cieo cieo-p-typeahead">
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
        className="cieo-p-typeahead-input"
      />
      {open ? (
        <div role="listbox" id={listId} className="cieo-p-typeahead-list">
          {children}
        </div>
      ) : null}
    </div>
  );
}
