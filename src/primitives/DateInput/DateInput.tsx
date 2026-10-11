'use client';
// src/primitives/DateInput/DateInput.tsx
/* DateInput. Labelled calendar-date field: one native date input reusing the shared input style from styles/controls.css. No new CSS. */
export interface DateInputProps {
  /** Visible label for the field (e.g. "Start date"). Required. */
  label: string;
}

export function DateInput({ label }: DateInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="date" className="cieo cieo-input" />
    </label>
  );
}
