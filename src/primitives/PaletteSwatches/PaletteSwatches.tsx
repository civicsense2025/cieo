'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* PaletteSwatches. Selectable row of color swatches as a native radiogroup. Arrow keys, checking, and form
   participation come from the radios; the dots are paint only. Swatch fills are content data (artwork colors),
   so they render from the swatch record, not from theme tokens. */
import { useState, type CSSProperties } from 'react';

export interface PaletteSwatch {
  /** Value reported to onValueChange and the form. Required. */
  value: string;
  /** Spoken and submitted name (e.g. "Ink #1F201C"). Required. */
  label: string;
  /** Dot fill as CSS color. Required. */
  color: string;
}

export interface PaletteSwatchesProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; swatch?: PrimitivePartProps; dot?: PrimitivePartProps };

  /** Accessible name for the group (e.g. "Vector colors"). Required. */
  label: string;
  /** Radio group name for form participation. Required. */
  name: string;
  /** Swatches in row order. Required, at least one. */
  swatches: PaletteSwatch[];
  /** Picked value when controlled. */
  value?: string;
  /** Initial picked value when uncontrolled. */
  defaultValue?: string;
  /** Called with the picked value. Host owns persistence. */
  onValueChange?: (value: string) => void;
  /** Disables every swatch. */
  disabled?: boolean;
  /** Dot size. Defaults to md. */
  size?: 'sm' | 'md';
}

export function PaletteSwatches({ className, slotProps, label, name, swatches, value, defaultValue, onValueChange, disabled, size = 'md' }: PaletteSwatchesProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  function pick(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div role="radiogroup" aria-label={label} data-size={size} className="cieo cieo-swatches" {...customizePart(slotProps?.root, "cieo cieo-swatches", undefined, className)}>
      {swatches.map((swatch) => {
        const picked = current === swatch.value;
        return (
          <label key={swatch.value} data-picked={picked} className="cieo-swatch" {...customizePart(slotProps?.swatch, "cieo-swatch", undefined)}>
            <input
              type="radio"
              name={name}
              value={swatch.value}
              checked={current === undefined ? undefined : picked}
              defaultChecked={value === undefined && defaultValue === swatch.value ? true : undefined}
              disabled={disabled}
              aria-label={swatch.label}
              onChange={() => pick(swatch.value)}
            />
            <span aria-hidden="true" className="cieo-swatch-dot" style={{ backgroundColor: swatch.color } as CSSProperties} {...customizePart(slotProps?.dot, "cieo-swatch-dot", { backgroundColor: swatch.color } as CSSProperties)} />
          </label>
        );
      })}
    </div>
  );
}
