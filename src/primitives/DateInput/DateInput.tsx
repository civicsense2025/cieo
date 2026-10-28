'use client';
/* DateInput. Single date field. Value, name and change events reach the host. */
import type { ChangeEvent } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface DateInputProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; label?: PrimitivePartProps; input?: PrimitivePartProps };

  label: string;
  /** Form field name. */
  name?: string;
  /** Controlled value (ISO string). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value string. */
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DateInput({ className, slotProps, label, name, value, defaultValue, onChange, min, max, disabled, required }: DateInputProps) {
  return (
    <label className="cieo" {...customizePart(slotProps?.root, "cieo", undefined, className)}>
      <span className="cieo-label" {...customizePart(slotProps?.label, "cieo-label", undefined)}>{label}</span>
      <input type="date" className="cieo cieo-input" name={name} value={value} defaultValue={value === undefined ? defaultValue : undefined} min={min} max={max} disabled={disabled} required={required} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.currentTarget.value)} {...customizePart(slotProps?.input, "cieo cieo-input", undefined)} />
    </label>
  );
}
