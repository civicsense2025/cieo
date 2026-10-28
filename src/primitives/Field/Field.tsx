'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Field. Label + control + help/error row. Host supplies the control with a matching id; error wins over description. */
import type { ReactNode } from 'react';
export interface FieldProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; label?: PrimitivePartProps; help?: PrimitivePartProps };
 label: string; htmlFor?: string; description?: string; error?: string; children: ReactNode; }
export function Field({ className, slotProps, label, htmlFor, description, error, children }: FieldProps) {
  const helpId = htmlFor ? (error ? `${htmlFor}-error` : description ? `${htmlFor}-help` : undefined) : undefined;
  return (<div className="cieo cieo-p-field" {...customizePart(slotProps?.root, "cieo cieo-p-field", undefined, className)}>
    <label htmlFor={htmlFor} {...customizePart(slotProps?.label)}>{label}</label>
    {children}
    {error ? <p id={helpId} role="alert" className="cieo-p-help" data-tone="danger" {...customizePart(slotProps?.help, "cieo-p-help")}>{error}</p> : description ? <p id={helpId} className="cieo-p-help" {...customizePart(slotProps?.help, "cieo-p-help")}>{description}</p> : null}
  </div>);
}
