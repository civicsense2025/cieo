// src/primitives/ChatComposerInput/ChatComposerInput.tsx
'use client';
/* ChatComposerInput. Controlled textarea for composing. Label required; host owns value state. */

export interface ChatComposerInputProps {
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

export function ChatComposerInput({ label, value, onChange, rows = 1, placeholder }: ChatComposerInputProps) {
  return (
    <textarea
      aria-label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="cieo cieo-chat-composer-input"
    />
  );
}
