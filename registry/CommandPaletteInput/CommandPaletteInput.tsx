// src/primitives/CommandPaletteInput/CommandPaletteInput.tsx
'use client';
/* CommandPaletteInput. Filter field for CommandPalette. Label stays available to assistive tech; value/onChange pass through. */
import { useId } from 'react';

export interface CommandPaletteInputProps {
  /** Accessible name for the filter field (e.g. "Filter commands"). Required. */
  label: string;
  /** Controlled filter text. Optional. */
  value?: string;
  /** Host filter hook. Optional. */
  onChange?: (value: string) => void;
  /** Short hint shown when empty. Optional. */
  placeholder?: string;
}

export function CommandPaletteInput({ label, value, onChange, placeholder }: CommandPaletteInputProps) {
  const id = useId();
  return (
    <div className="cieo cieo-p-command-palette-input">
      <label htmlFor={id} className="cieo-vh">
        {label}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        className="cieo-p-command-palette-input-field"
      />
    </div>
  );
}
