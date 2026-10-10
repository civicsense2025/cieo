'use client';
// src/primitives/TimeInput/TimeInput.tsx
/* TimeInput. Labelled time-of-day field: one native time input reusing the shared input style from styles/controls.css. No new CSS. */
export interface TimeInputProps {
  /** Visible label for the field (e.g. "Opens at"). Required. */
  label: string;
}

export function TimeInput({ label }: TimeInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="time" className="cieo cieo-input" />
    </label>
  );
}
