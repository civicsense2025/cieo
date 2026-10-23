// src/primitives/Tokenizer/Tokenizer.tsx
'use client';
/* Tokenizer. Token chips plus an add input. Chips are own spans (not the Token primitive); host owns the value list. */
import { useId, useState } from 'react';

export interface TokenizerProps {
  /** Visible label naming the set. Required. */
  label: string;
  /** Current tokens, owned by the host. Required. */
  values: string[];
  /** Host remove hook by index. Optional. */
  onRemove?: (index: number) => void;
  /** Host add hook with trimmed input text. Optional. */
  onAdd?: (text: string) => void;
}

export function Tokenizer({ label, values, onRemove, onAdd }: TokenizerProps) {
  const id = useId();
  const [draft, setDraft] = useState('');
  return (
    <div className="cieo cieo-p-tokenizer">
      <label htmlFor={id}>{label}</label>
      <div className="cieo-p-tokenizer-chips">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="cieo-p-tokenizer-chip">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onRemove?.(i)}>
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && draft === '' && values.length > 0) onRemove?.(values.length - 1);
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault();
              onAdd?.(draft.trim());
              setDraft('');
            }
          }}
          className="cieo-p-tokenizer-input"
        />
      </div>
    </div>
  );
}
