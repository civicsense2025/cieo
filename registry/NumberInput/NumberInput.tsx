'use client';
/* NumberInput. Numeric field. Value, name and change events reach the host; onChange gets a number, or null when the field is empty. */
import type { ChangeEvent } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface NumberInputProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; label?: PrimitivePartProps; input?: PrimitivePartProps };

  label: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  /** Controlled value; null shows an empty field. */
  value?: number | null;
  /** Form field name. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** Called with the parsed number, or null when emptied. */
  onChange?: (value: number | null) => void;
}

export function NumberInput({ className, slotProps, label, min, max, step, defaultValue, value, name, disabled, required, onChange }: NumberInputProps) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    onChange?.(raw === '' || Number.isNaN(e.currentTarget.valueAsNumber) ? null : e.currentTarget.valueAsNumber);
  };
  return (
    <label className="cieo" {...customizePart(slotProps?.root, "cieo", undefined, className)}>
      <span className="cieo-label" {...customizePart(slotProps?.label, "cieo-label", undefined)}>{label}</span>
      <input type="number" className="cieo cieo-input" name={name} min={min} max={max} step={step} value={value === undefined ? undefined : (value ?? '')} defaultValue={value === undefined ? defaultValue : undefined} disabled={disabled} required={required} onChange={handle} {...customizePart(slotProps?.input, "cieo cieo-input", undefined)} />
    </label>
  );
}
