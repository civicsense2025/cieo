// src/primitives/ComplexSelector/ComplexSelector.tsx
'use client';
/* ComplexSelector. Label plus a native select grouped into optgroups. Renders the design-system .cieo-input; this file owns the contract, not the paint. */
import { useId } from 'react';

export interface ComplexSelectorSection {
  label: string;
  options: Array<{ value: string; label?: string }>;
}

export interface ComplexSelectorProps {
  /** Visible label naming the field. Required. */
  label: string;
  /** Grouped sections rendered as optgroups. Required. */
  sections: ComplexSelectorSection[];
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the chosen option value. */
  onChange?: (value: string) => void;
  /** Form field name. */
  name?: string;
  disabled?: boolean;
}

export function ComplexSelector({ label, sections, value, defaultValue, onChange, name, disabled }: ComplexSelectorProps) {
  const id = useId();
  return (
    <div className="cieo cieo-p-complex-selector">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} disabled={disabled} value={value} defaultValue={value === undefined ? defaultValue : undefined} onChange={(e) => onChange?.(e.currentTarget.value)} className="cieo-input">
        {sections.map((s) => (
          <optgroup key={s.label} label={s.label}>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label ?? o.value}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
