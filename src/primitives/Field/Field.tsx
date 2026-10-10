'use client';
/* Field. Label + control + help/error row. Host supplies the control with a matching id; error wins over description. */
import type { ReactNode } from 'react';
export interface FieldProps { label: string; htmlFor?: string; description?: string; error?: string; children: ReactNode; }
export function Field({ label, htmlFor, description, error, children }: FieldProps) {
  const helpId = htmlFor ? (error ? `${htmlFor}-error` : description ? `${htmlFor}-help` : undefined) : undefined;
  return (<div className="cieo cieo-p-field">
    <label htmlFor={htmlFor}>{label}</label>
    {children}
    {error ? <p id={helpId} role="alert" className="cieo-p-help" data-tone="danger">{error}</p> : description ? <p id={helpId} className="cieo-p-help">{description}</p> : null}
  </div>);
}
