// src/primitives/CommandPaletteInput/CommandPaletteInput.tsx
'use client';
/* CommandPaletteInput. Filter field for CommandPalette. Label stays available to assistive tech; value/onChange pass through. */
import { useContext, useId } from 'react';
import { CommandPaletteContext } from '../CommandPalette/CommandPalette.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CommandPaletteInputProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; field?: PrimitivePartProps };

  /** Accessible name for the filter field (e.g. "Filter commands"). Required. */
  label: string;
  /** Controlled filter text. Optional. */
  value?: string;
  /** Host filter hook. Optional. */
  onChange?: (value: string) => void;
  /** Short hint shown when empty. Optional. */
  placeholder?: string;
}

export function CommandPaletteInput({ className, slotProps, label, value, onChange, placeholder }: CommandPaletteInputProps) {
  const id = useId();
  const palette = useContext(CommandPaletteContext);
  const current = value ?? palette?.query;
  const emit = onChange ?? palette?.onQueryChange;
  return (
    <div className="cieo cieo-p-command-palette-input" {...customizePart(slotProps?.root, "cieo cieo-p-command-palette-input", undefined, className)}>
      <label htmlFor={id} className="cieo-vh">
        {label}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        value={current}
        placeholder={placeholder}
        onChange={(e) => emit?.(e.currentTarget.value)}
        className="cieo-p-command-palette-input-field" {...customizePart(slotProps?.field, "cieo-p-command-palette-input-field", undefined)}
      />
    </div>
  );
}
