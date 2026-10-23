'use client';
/* TimeInput. Time-of-day field. Value, name and change events reach the host. */
import type { ChangeEvent } from 'react';

export interface TimeInputProps {
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

export function TimeInput({ label, name, value, defaultValue, onChange, min, max, disabled, required }: TimeInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="time" className="cieo cieo-input" name={name} value={value} defaultValue={value === undefined ? defaultValue : undefined} min={min} max={max} disabled={disabled} required={required} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.currentTarget.value)} />
    </label>
  );
}
