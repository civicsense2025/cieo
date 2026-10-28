// src/primitives/ChatComposerInput/ChatComposerInput.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ChatComposerInput. Controlled textarea for composing. Label required; host owns value state. */

export interface ChatComposerInputProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the input (e.g. "Message support"). Required. */
  label: string;
  /** Current text. Host-controlled. Optional. */
  value?: string;
  /** Called on each edit. Host updates value. Optional. */
  onChange?: (value: string) => void;
  /** Visible row count. Defaults to 1. */
  rows?: number;
  /** Placeholder hint. Optional. */
  placeholder?: string;
}

export function ChatComposerInput({ className, slotProps, label, value, onChange, rows = 1, placeholder }: ChatComposerInputProps) {
  return (
    <textarea
      aria-label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="cieo cieo-chat-composer-input" {...customizePart(slotProps?.root, "cieo cieo-chat-composer-input", undefined, className)}
    />
  );
}
