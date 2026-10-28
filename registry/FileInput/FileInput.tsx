'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* FileInput. Native file picker. onChange receives the chosen files. */
export interface FileInputProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; label?: PrimitivePartProps; input?: PrimitivePartProps };

  label: string;
  name?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Called with the chosen files (empty array when cleared). */
  onChange?: (files: File[]) => void;
}

export function FileInput({ className, slotProps, label, name, accept, multiple = false, disabled, required, onChange }: FileInputProps) {
  return (
    <label className="cieo" {...customizePart(slotProps?.root, "cieo", undefined, className)}>
      <span className="cieo-label" {...customizePart(slotProps?.label, "cieo-label", undefined)}>{label}</span>
      <input type="file" className="cieo cieo-input" name={name} accept={accept} multiple={multiple} disabled={disabled} required={required} onChange={(e) => onChange?.([...(e.currentTarget.files ?? [])])} {...customizePart(slotProps?.input, "cieo cieo-input", undefined)} />
    </label>
  );
}
