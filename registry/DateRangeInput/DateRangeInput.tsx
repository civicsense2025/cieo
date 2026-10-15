'use client';
// src/primitives/DateRangeInput/DateRangeInput.tsx
/* DateRangeInput. Labelled start/end date pair: two native date inputs under one group name, reusing the shared input style from styles/controls.css. No new CSS. */
export interface DateRangeInputProps {
  /** Accessible name for the range (e.g. "Trip dates"). Required. */
  label: string;
}

export function DateRangeInput({ label }: DateRangeInputProps) {
  return (
    <div role="group" aria-label={label} className="cieo">
      <label className="cieo">
        <span className="cieo-label">Start</span>
        <input type="date" className="cieo cieo-input" name="start" />
      </label>
      <label className="cieo">
        <span className="cieo-label">End</span>
        <input type="date" className="cieo cieo-input" name="end" />
      </label>
    </div>
  );
}
