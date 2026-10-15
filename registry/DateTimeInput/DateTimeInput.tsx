'use client';
// src/primitives/DateTimeInput/DateTimeInput.tsx
/* DateTimeInput. Labelled date-and-time field: one native datetime-local input reusing the shared input style from styles/controls.css. No new CSS. */
export interface DateTimeInputProps {
  /** Visible label for the field (e.g. "Meeting time"). Required. */
  label: string;
}

export function DateTimeInput({ label }: DateTimeInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="datetime-local" className="cieo cieo-input" />
    </label>
  );
}
