'use client';
// src/primitives/NumberInput/NumberInput.tsx
/* NumberInput. Labelled numeric field: one native number input reusing the shared input style from styles/controls.css. No new CSS. */
export interface NumberInputProps {
  /** Visible label for the field (e.g. "Quantity"). Required. */
  label: string;
  /** Minimum value. Optional. */
  min?: number;
  /** Maximum value. Optional. */
  max?: number;
  /** Step between values. Optional. */
  step?: number;
  /** Initial value (uncontrolled). Optional. */
  defaultValue?: number;
}

export function NumberInput({ label, min, max, step, defaultValue }: NumberInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="number" className="cieo cieo-input" min={min} max={max} step={step} defaultValue={defaultValue} />
    </label>
  );
}
