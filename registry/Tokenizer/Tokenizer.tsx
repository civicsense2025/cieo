// src/primitives/Tokenizer/Tokenizer.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Tokenizer. Token chips plus an add input. Chips are own spans (not the Token primitive); host owns the value list. */
import { useId, useState } from 'react';

export interface TokenizerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; chips?: PrimitivePartProps; chip?: PrimitivePartProps; input?: PrimitivePartProps };

  /** Visible label naming the set. Required. */
  label: string;
  /** Current tokens, owned by the host. Required. */
  values: string[];
  /** Host remove hook by index. Optional. */
  onRemove?: (index: number) => void;
  /** Host add hook with trimmed input text. Optional. */
  onAdd?: (text: string) => void;
}

export function Tokenizer({ className, slotProps, label, values, onRemove, onAdd }: TokenizerProps) {
  const id = useId();
  const [draft, setDraft] = useState('');
  return (
    <div className="cieo cieo-p-tokenizer" {...customizePart(slotProps?.root, "cieo cieo-p-tokenizer", undefined, className)}>
      <label htmlFor={id}>{label}</label>
      <div className="cieo-p-tokenizer-chips" {...customizePart(slotProps?.chips, "cieo-p-tokenizer-chips")}>
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="cieo-p-tokenizer-chip" {...customizePart(slotProps?.chip, "cieo-p-tokenizer-chip")}>
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
          className="cieo-p-tokenizer-input" {...customizePart(slotProps?.input, "cieo-p-tokenizer-input")}
        />
      </div>
    </div>
  );
}
