'use client';
/* DateRangeInput. Start and end date fields in one group. Works controlled via value or uncontrolled via defaultValue; onChange gets both ends. */
import { useId, useState } from 'react';

export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangeInputProps {
  label: string;
  /** Controlled range (ISO date strings, empty string when unset). */
  value?: DateRange;
  /** Initial range when uncontrolled. */
  defaultValue?: DateRange;
  /** Called with the next range after either end changes. */
  onChange?: (range: DateRange) => void;
  disabled?: boolean;
}

export function DateRangeInput({ label, value, defaultValue, onChange, disabled }: DateRangeInputProps) {
  const [inner, setInner] = useState<DateRange>(defaultValue ?? { start: '', end: '' });
  const current = value ?? inner;
  const id = useId();
  const set = (patch: Partial<DateRange>) => {
    const next = { ...current, ...patch };
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return (
    <div role="group" aria-label={label} className="cieo">
      <label className="cieo" htmlFor={`${id}-start`}>
        <span className="cieo-label">Start</span>
        <input id={`${id}-start`} type="date" className="cieo cieo-input" name="start" value={current.start} max={current.end || undefined} disabled={disabled} onChange={(e) => set({ start: e.currentTarget.value })} />
      </label>
      <label className="cieo" htmlFor={`${id}-end`}>
        <span className="cieo-label">End</span>
        <input id={`${id}-end`} type="date" className="cieo cieo-input" name="end" value={current.end} min={current.start || undefined} disabled={disabled} onChange={(e) => set({ end: e.currentTarget.value })} />
      </label>
    </div>
  );
}
